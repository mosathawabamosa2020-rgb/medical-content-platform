#!/usr/bin/env node
/* REC-007 / TASK-036: backup baseline for local operational artifacts and optional DB dump. */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const rootDir = process.cwd()
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupRoot = path.join(rootDir, 'artifacts', 'backups')
const backupDir = path.join(backupRoot, timestamp)

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
  return true
}

function cmdExists(command) {
  const checker = process.platform === 'win32' ? 'where' : 'which'
  const result = spawnSync(checker, [command], { stdio: 'ignore' })
  return result.status === 0
}

function runPgDump(databaseUrl, outputFile) {
  if (!databaseUrl || !/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL missing or not postgres' }
  }
  if (!cmdExists('pg_dump')) {
    return { ok: false, skipped: true, reason: 'pg_dump not found in PATH' }
  }
  const args = ['--file', outputFile, '--dbname', databaseUrl, '--no-owner', '--no-privileges']
  const result = spawnSync('pg_dump', args, { encoding: 'utf8' })
  if (result.status !== 0) {
    return {
      ok: false,
      skipped: false,
      reason: 'pg_dump failed',
      stderr: (result.stderr || '').trim() || null,
    }
  }
  return { ok: true, skipped: false }
}

function main() {
  ensureDir(backupDir)

  const copied = []
  const skipped = []

  const fileCandidates = [
    ['data/platform-settings.json', 'data/platform-settings.json'],
    ['data/audit-trail.log', 'data/audit-trail.log'],
    ['prisma/dev.db', 'prisma/dev.db'],
  ]

  for (const [srcRel, destRel] of fileCandidates) {
    const srcAbs = path.join(rootDir, srcRel)
    const destAbs = path.join(backupDir, destRel)
    if (copyIfExists(srcAbs, destAbs)) copied.push(srcRel)
    else skipped.push(srcRel)
  }

  const dbDumpPath = path.join(backupDir, 'database.sql')
  const dbResult = runPgDump(process.env.DATABASE_URL, dbDumpPath)

  const manifest = {
    backupId: timestamp,
    createdAt: new Date().toISOString(),
    backupDir: path.relative(rootDir, backupDir),
    copiedFiles: copied,
    skippedFiles: skipped,
    databaseDump: dbResult,
  }
  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  fs.writeFileSync(path.join(backupRoot, 'latest.json'), JSON.stringify(manifest, null, 2))

  console.log(JSON.stringify(manifest, null, 2))
  if (!dbResult.ok && !dbResult.skipped) process.exitCode = 1
}

main()
