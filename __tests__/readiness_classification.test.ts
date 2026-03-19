import { jest } from '@jest/globals'

const { getReadinessSnapshot } = require('../lib/ops/readiness')

describe('readiness classification', () => {
  test('classifies missing env as missing_config', async () => {
    const snapshot = await getReadinessSnapshot({
      env: {},
      requiredEnv: ['DATABASE_URL'],
      checkDatabase: async () => ({ ok: true }),
      checkRedis: async () => ({ ok: true }),
      timeoutMs: 10,
    })
    expect(snapshot.checks.environment.classification).toBe('missing_config')
    expect(snapshot.checks.environment.remediation).toContain('DATABASE_URL')
  })

  test('classifies database timeout as timeout', async () => {
    const snapshot = await getReadinessSnapshot({
      env: { DATABASE_URL: 'postgres://example', NEXTAUTH_SECRET: 'x' },
      requiredEnv: ['DATABASE_URL', 'NEXTAUTH_SECRET'],
      checkDatabase: () => new Promise(() => {}),
      checkRedis: async () => ({ ok: true }),
      timeoutMs: 5,
    })
    expect(snapshot.checks.database.classification).toBe('timeout')
  })

  test('classifies missing redis as optional_absence', async () => {
    const snapshot = await getReadinessSnapshot({
      env: { DATABASE_URL: 'postgres://example', NEXTAUTH_SECRET: 'x' },
      requiredEnv: ['DATABASE_URL', 'NEXTAUTH_SECRET'],
      checkDatabase: async () => ({ ok: true }),
      redisUrl: '',
      timeoutMs: 10,
    })
    expect(snapshot.checks.redis.classification).toBe('optional_absence')
  })
})
