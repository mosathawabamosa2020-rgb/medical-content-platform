#!/usr/bin/env node
/* REC-007 / TASK-036: restore baseline for local operational artifacts and optional DB restore. */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const rootDir = process.cwd()
const backupRoot = path.join(rootDir, 'artifacts', 'backups')

function cmdExists(command) {
  const checker = process.platform === 'win32' ? 'where' : 'which'
  const result = spawnSync(checker, [command], { stdio: 'ignore' })
  return result.status === 0
}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { from: null, skipDb: false }
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i]
    if (token === '--from') out.from = args[i + 1] || null
    if (token === '--skip-db') out.skipDb = true
  }
  return out
}

function resolveBackupDir(fromArg) {
  if (fromArg) return path.isAbsolute(fromArg) ? fromArg : path.join(rootDir, fromArg)
  const latestPath = path.join(backupRoot, 'latest.json')
  if (!fs.existsSync(latestPath)) throw new Error('No latest backup manifest found. Pass --from <path>.')
  const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'))
  return path.join(rootDir, latest.backupDir)
}

function copyBack(src, dest) {
  if (!fs.existsSync(src)) return false
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  return true
}

function restoreDbSql(sqlPath) {
  if (!fs.existsSync(sqlPath)) return { ok: false, skipped: true, reason: 'database.sql not found in backup' }
  if (!process.env.DATABASE_URL) return { ok: false, skipped: true, reason: 'DATABASE_URL missing' }
  if (!cmdExists('psql')) return { ok: false, skipped: true, reason: 'psql not found in PATH' }
  const result = spawnSync('psql', [process.env.DATABASE_URL, '-f', sqlPath], { encoding: 'utf8' })
  if (result.status !== 0) {
    return {
      ok: false,
      skipped: false,
      reason: 'psql restore failed',
      stderr: (result.stderr || '').trim() || null,
    }
  }
  return { ok: true, skipped: false }
}

function main() {
  const args = parseArgs()
  const backupDir = resolveBackupDir(args.from)
  const manifestPath = path.join(backupDir, 'manifest.json')
  if (!fs.existsSync(manifestPath)) throw new Error(`Backup manifest not found at ${manifestPath}`)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  const restored = []
  const skipped = []
  const restoreFiles = ['data/platform-settings.json', 'data/audit-trail.log', 'prisma/dev.db']
  for (const relPath of restoreFiles) {
    const src = path.join(backupDir, relPath)
    const dest = path.join(rootDir, relPath)
    if (copyBack(src, dest)) restored.push(relPath)
    else skipped.push(relPath)
  }

  let dbRestore = { ok: false, skipped: true, reason: 'skipped by flag' }
  if (!args.skipDb) dbRestore = restoreDbSql(path.join(backupDir, 'database.sql'))

  const summary = {
    restoredFrom: path.relative(rootDir, backupDir),
    basedOnBackupId: manifest.backupId,
    restoredFiles: restored,
    skippedFiles: skipped,
    databaseRestore: dbRestore,
    restoredAt: new Date().toISOString(),
  }
  console.log(JSON.stringify(summary, null, 2))
  if (!dbRestore.ok && !dbRestore.skipped) process.exitCode = 1
}

main()
