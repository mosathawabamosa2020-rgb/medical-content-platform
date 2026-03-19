#!/usr/bin/env node
/* REC-008 / TASK-037: lightweight operational readiness snapshot for local verification. */
const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

async function checkDatabase() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err?.message || 'db check failed' }
  }
}

function safeStat(relativePath) {
  const abs = path.join(rootDir, relativePath)
  if (!fs.existsSync(abs)) return { exists: false, size: 0, mtime: null }
  const stat = fs.statSync(abs)
  return { exists: true, size: stat.size, mtime: stat.mtime.toISOString() }
}

function getLatestBackupManifest() {
  const latestPath = path.join(rootDir, 'artifacts', 'backups', 'latest.json')
  if (!fs.existsSync(latestPath)) return { exists: false }
  try {
    return { exists: true, ...JSON.parse(fs.readFileSync(latestPath, 'utf8')) }
  } catch (err) {
    return { exists: true, parseError: err?.message || 'failed to parse latest backup manifest' }
  }
}

async function main() {
  const db = await checkDatabase()
  const settings = safeStat('data/platform-settings.json')
  const audit = safeStat('data/audit-trail.log')
  const latestBackup = getLatestBackupManifest()

  const snapshot = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV || null,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasRedisUrl: Boolean(process.env.REDIS_URL),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    },
    health: {
      database: db,
      settingsStore: settings,
      auditTrail: audit,
      latestBackup,
    },
  }

  const outputDir = path.join(rootDir, 'artifacts')
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'ops-readiness-snapshot-2026-03-08.json')
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2))
  console.log(JSON.stringify(snapshot, null, 2))
}

main()
