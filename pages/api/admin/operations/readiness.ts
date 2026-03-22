import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import prisma from '../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'

function safeStat(relativePath: string) {
  const abs = path.join(process.cwd(), relativePath)
  if (!fs.existsSync(abs)) return { exists: false, size: 0, mtime: null }
  const stat = fs.statSync(abs)
  return { exists: true, size: stat.size, mtime: stat.mtime.toISOString() }
}

function readLatestBackupManifest() {
  const latestPath = path.join(process.cwd(), 'artifacts', 'backups', 'latest.json')
  if (!fs.existsSync(latestPath)) return { exists: false }
  try {
    return { exists: true, ...JSON.parse(fs.readFileSync(latestPath, 'utf8')) }
  } catch (err: any) {
    return { exists: true, parseError: err?.message || 'failed to parse latest backup manifest' }
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })

  let database: { status: 'ok' | 'error'; message?: string } = { status: 'ok' }
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err: any) {
    database = { status: 'error', message: err?.message || 'database query failed' }
  }

  return res.status(200).json({
    status: 'ok',
    checks: {
      database,
      settingsStore: safeStat('data/platform-settings.json'),
      auditTrail: safeStat('data/audit-trail.log'),
      latestBackup: readLatestBackupManifest(),
    },
  })
}

export default withAdminAuth(handler)
