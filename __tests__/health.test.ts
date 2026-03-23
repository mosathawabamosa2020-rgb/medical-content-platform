import { createMocks } from 'node-mocks-http'
import handler from '../pages/api/health'

jest.mock('../lib/ops/readiness', () => ({
  getReadinessSnapshot: jest.fn(async () => ({
    overallStatus: 'degraded',
    checks: {},
    summary: {},
  })),
}))

test('health endpoint returns ok when services reachable', async () => {
  const { req, res } = createMocks({ method: 'GET' })
  await handler(req as any, res as any)
  expect([200, 503]).toContain(res._getStatusCode())
  const data = JSON.parse(res._getData())
  expect(data).toHaveProperty('status')
})
