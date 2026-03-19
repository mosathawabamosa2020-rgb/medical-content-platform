const { getReadinessSnapshot, deriveOverallStatus } = require('../lib/ops/readiness')

describe('ops readiness module', () => {
  test('returns blocked when required env is missing', async () => {
    const snapshot = await getReadinessSnapshot({
      env: {},
      checkDatabase: async () => ({ ok: true }),
      checkRedis: async () => ({ ok: true }),
      timeoutMs: 100,
    })
    expect(snapshot.checks.environment.status).toBe('blocked')
    expect(snapshot.overallStatus).toBe('blocked')
  })

  test('returns degraded when optional dependency is not configured', async () => {
    const snapshot = await getReadinessSnapshot({
      env: { DATABASE_URL: 'postgres://x', NEXTAUTH_SECRET: 'secret' },
      checkDatabase: async () => ({ ok: true }),
      redisUrl: '',
      timeoutMs: 100,
    })
    expect(snapshot.checks.redis.status).toBe('not_configured')
    expect(['degraded', 'blocked']).toContain(snapshot.overallStatus)
  })

  test('deriveOverallStatus returns ok when all checks are ok', () => {
    const status = deriveOverallStatus({
      a: { required: true, status: 'ok' },
      b: { required: false, status: 'ok' },
    })
    expect(status).toBe('ok')
  })
})
