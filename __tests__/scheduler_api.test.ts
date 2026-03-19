import { createMocks } from 'node-mocks-http'

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))
jest.mock('../lib/queue/queues', () => ({
  ensureSchedulersStarted: jest.fn().mockResolvedValue(undefined),
}))

describe('scheduler endpoint', () => {
  beforeEach(() => jest.clearAllMocks())

  test('accepts admin and starts schedulers', async () => {
    const { getServerSession } = require('next-auth/next') as any
    const { ensureSchedulersStarted } = require('../lib/queue/queues')
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })

    const { req, res } = createMocks({ method: 'POST' })
    const handler = require('../pages/api/admin/ingestion/scheduler').default
    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(200)
    expect(ensureSchedulersStarted).toHaveBeenCalled()
  })
})
