import fs from 'fs'
import path from 'path'

export type AuditEvent = {
  event: string
  actorId?: string | null
  entityType?: string
  entityId?: string
  payload?: Record<string, unknown>
  at: string
}

const AUDIT_PATH = path.join(process.cwd(), 'data', 'audit-trail.log')

function ensureDir() {
  const dir = path.dirname(AUDIT_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function writeAuditEvent(input: Omit<AuditEvent, 'at'>) {
  ensureDir()
  const row: AuditEvent = { ...input, at: new Date().toISOString() }
  fs.appendFileSync(AUDIT_PATH, JSON.stringify(row) + '\n', 'utf8')
}

export function readRecentAuditEvents(limit = 200): AuditEvent[] {
  ensureDir()
  if (!fs.existsSync(AUDIT_PATH)) return []
  const lines = fs
    .readFileSync(AUDIT_PATH, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const selected = lines.slice(-Math.max(1, Math.min(2000, limit)))
  return selected
    .map((l) => {
      try {
        return JSON.parse(l) as AuditEvent
      } catch {
        return null
      }
    })
    .filter((x): x is AuditEvent => Boolean(x))
    .reverse()
}
