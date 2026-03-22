const fs = require('node:fs')
const path = require('node:path')

const DEFAULT_TIMEOUT_MS = 7000

function nowMs() {
  return Date.now()
}

function withTimeout(promiseFactory, timeoutMs, timeoutCode) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ timedOut: true, timeoutCode }), timeoutMs)
    Promise.resolve()
      .then(promiseFactory)
      .then((value) => {
        clearTimeout(timer)
        resolve({ timedOut: false, value })
      })
      .catch((error) => {
        clearTimeout(timer)
        resolve({ timedOut: false, error })
      })
  })
}

function normalizeCheck(name, required, status, message, details, startedAt, classification, remediation) {
  return {
    name,
    required,
    status,
    message,
    details: details || null,
    classification: classification || null,
    remediation: remediation || null,
    durationMs: Math.max(0, nowMs() - startedAt),
  }
}

async function checkDatabase(timeoutMs, opts = {}) {
  const startedAt = nowMs()
  const checkFn = opts.checkDatabase
  const probe = async () => {
    if (typeof checkFn === 'function') return checkFn()
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    try {
      await prisma.$queryRaw`SELECT 1`
      await prisma.$disconnect()
      return { ok: true }
    } catch (error) {
      await prisma.$disconnect().catch(() => null)
      throw error
    }
  }

  const result = await withTimeout(probe, timeoutMs, 'db_timeout')
  if (result.timedOut) {
    return normalizeCheck(
      'database',
      true,
      'blocked',
      'database check timed out',
      result.timeoutCode,
      startedAt,
      'timeout',
      'Verify database connectivity and consider raising HEALTH_CHECK_TIMEOUT_MS.'
    )
  }
  if (result.error) {
    return normalizeCheck(
      'database',
      true,
      'blocked',
      result.error.message || 'database check failed',
      null,
      startedAt,
      'unreachable_dependency',
      'Check DATABASE_URL and ensure the database service is running.'
    )
  }
  return normalizeCheck('database', true, 'ok', 'database query succeeded', null, startedAt, 'ok', null)
}

async function checkRedis(timeoutMs, opts = {}) {
  const startedAt = nowMs()
  const redisUrl = opts.redisUrl || process.env.REDIS_URL || ''
  if (!redisUrl) {
    return normalizeCheck(
      'redis',
      false,
      'not_configured',
      'REDIS_URL not configured',
      null,
      startedAt,
      'optional_absence',
      'Set REDIS_URL to enable redis connectivity checks.'
    )
  }

  const checkFn = opts.checkRedis
  const probe = async () => {
    if (typeof checkFn === 'function') return checkFn(redisUrl)
    const Redis = require('ioredis')
    const redis = new Redis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false })
    try {
      await redis.ping()
      redis.disconnect()
      return { ok: true }
    } catch (error) {
      try {
        redis.disconnect()
      } catch {}
      throw error
    }
  }

  const result = await withTimeout(probe, timeoutMs, 'redis_timeout')
  if (result.timedOut) {
    return normalizeCheck(
      'redis',
      false,
      'degraded',
      'redis check timed out',
      result.timeoutCode,
      startedAt,
      'timeout',
      'Verify REDIS_URL connectivity or increase HEALTH_CHECK_TIMEOUT_MS.'
    )
  }
  if (result.error) {
    return normalizeCheck(
      'redis',
      false,
      'degraded',
      result.error.message || 'redis check failed',
      null,
      startedAt,
      'unreachable_dependency',
      'Ensure redis is reachable and credentials are valid.'
    )
  }
  return normalizeCheck('redis', false, 'ok', 'redis ping succeeded', null, startedAt, 'ok', null)
}

function checkEnvRequired(opts = {}) {
  const startedAt = nowMs()
  const env = opts.env || process.env
  const requiredVars = opts.requiredEnv || ['DATABASE_URL', 'NEXTAUTH_SECRET']
  const missing = requiredVars.filter((name) => !env[name])
  if (missing.length > 0) {
    return normalizeCheck(
      'environment',
      true,
      'blocked',
      `missing required env vars: ${missing.join(', ')}`,
      { missing },
      startedAt,
      'missing_config',
      `Set required env vars: ${missing.join(', ')}.`
    )
  }
  return normalizeCheck('environment', true, 'ok', 'required env vars are present', null, startedAt, 'ok', null)
}

function checkWritablePath(name, filePath, required) {
  const startedAt = nowMs()
  const abs = path.join(process.cwd(), filePath)
  try {
    const dir = path.dirname(abs)
    fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(abs)) {
      return normalizeCheck(
        name,
        required,
        required ? 'degraded' : 'not_configured',
        `${filePath} missing`,
        { path: filePath },
        startedAt,
        required ? 'writable_path_issue' : 'optional_absence',
        required ? `Create ${filePath} or run the platform to generate it.` : `Optional file missing: ${filePath}.`
      )
    }
    fs.accessSync(abs, fs.constants.W_OK)
    return normalizeCheck(
      name,
      required,
      'ok',
      `${filePath} writable`,
      { path: filePath },
      startedAt,
      'ok',
      null
    )
  } catch (error) {
    return normalizeCheck(
      name,
      required,
      required ? 'blocked' : 'degraded',
      error.message || `${filePath} check failed`,
      { path: filePath },
      startedAt,
      'writable_path_issue',
      `Ensure ${filePath} exists and is writable.`
    )
  }
}

function checkBackupManifest() {
  const startedAt = nowMs()
  const filePath = path.join('artifacts', 'backups', 'latest.json')
  const abs = path.join(process.cwd(), filePath)
  if (!fs.existsSync(abs)) {
    return normalizeCheck(
      'backup_manifest',
      false,
      'not_configured',
      'backup manifest missing',
      { path: filePath },
      startedAt,
      'optional_absence',
      'Run backup workflow to generate artifacts/backups/latest.json.'
    )
  }
  return normalizeCheck(
    'backup_manifest',
    false,
    'ok',
    'backup manifest found',
    { path: filePath },
    startedAt,
    'ok',
    null
  )
}

function deriveOverallStatus(checks) {
  const values = Object.values(checks)
  const required = values.filter((c) => c.required)
  const optional = values.filter((c) => !c.required)

  const hasRequiredFailure = required.some((c) => c.status !== 'ok')
  if (hasRequiredFailure) return 'blocked'

  const hasOptionalIssue = optional.some((c) => c.status !== 'ok')
  if (hasOptionalIssue) return 'degraded'

  return 'ok'
}

async function getReadinessSnapshot(opts = {}) {
  const timeoutMs = Number(opts.timeoutMs || process.env.HEALTH_CHECK_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  const checks = {}

  checks.environment = checkEnvRequired(opts)
  checks.database = await checkDatabase(timeoutMs, opts)
  checks.redis = await checkRedis(timeoutMs, opts)
  checks.settings_store = checkWritablePath('settings_store', path.join('data', 'platform-settings.json'), true)
  checks.audit_trail = checkWritablePath('audit_trail', path.join('data', 'audit-trail.log'), true)
  checks.backup_manifest = checkBackupManifest()

  const overall = deriveOverallStatus(checks)
  return {
    generatedAt: new Date().toISOString(),
    timeoutMs,
    checks,
    overallStatus: overall,
    summary: {
      requiredOk: Object.values(checks).filter((c) => c.required && c.status === 'ok').length,
      requiredTotal: Object.values(checks).filter((c) => c.required).length,
      optionalIssues: Object.values(checks).filter((c) => !c.required && c.status !== 'ok').length,
    },
  }
}

module.exports = {
  getReadinessSnapshot,
  deriveOverallStatus,
}
