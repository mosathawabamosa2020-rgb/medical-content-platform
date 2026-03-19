import { createMocks } from 'node-mocks-http'

jest.mock('../lib/queue/queues', () => ({
  ensureSchedulersStarted: jest.fn().mockResolvedValue(undefined),
  enqueueIngestionJob: jest.fn().mockResolvedValue({ mode: 'inline', id: null }),
}))

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

const { enqueueIngestionJob, ensureSchedulersStarted } = require('../lib/queue/queues')

describe('run-worker endpoint', () => {
  beforeEach(() => jest.clearAllMocks())

  test('rejects non-post methods', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/ingestion/run-worker').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(405)
  })

  test('forbids non-admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'editor' } })
    const { req, res } = createMocks({ method: 'POST' })
    const handler = require('../pages/api/admin/ingestion/run-worker').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(403)
    expect(enqueueIngestionJob).not.toHaveBeenCalled()
  })

  test('accepts admin and enqueues worker job', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    const { req, res } = createMocks({ method: 'POST' })
    const handler = require('../pages/api/admin/ingestion/run-worker').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(202)
    expect(ensureSchedulersStarted).toHaveBeenCalled()
    expect(enqueueIngestionJob).toHaveBeenCalled()
  })
})
