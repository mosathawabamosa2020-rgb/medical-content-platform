export type ReadinessStatus = 'ok' | 'degraded' | 'blocked' | 'not_configured' | 'error'

export interface ReadinessCheck {
  name: string
  required: boolean
  status: ReadinessStatus
  message: string
  details: unknown
  classification: string | null
  remediation: string | null
  durationMs: number
}

export interface ReadinessSnapshot {
  generatedAt: string
  timeoutMs: number
  checks: Record<string, ReadinessCheck>
  overallStatus: 'ok' | 'degraded' | 'blocked'
  summary: {
    requiredOk: number
    requiredTotal: number
    optionalIssues: number
  }
}

export function getReadinessSnapshot(opts?: any): Promise<ReadinessSnapshot>
export function deriveOverallStatus(checks: Record<string, ReadinessCheck>): 'ok' | 'degraded' | 'blocked'
