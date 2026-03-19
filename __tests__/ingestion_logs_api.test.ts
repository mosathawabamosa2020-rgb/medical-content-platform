import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    ingestionLog: { findMany: jest.fn() },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

const { PrismaClient } = require('@prisma/client')

describe('ingestion logs API', () => {
  beforeEach(() => jest.clearAllMocks())

  test('denies non-admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'editor' } })

    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/ingestion/logs').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(403)
  })

  test('returns log entries for admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })

    const fakeLogs = [{ id: 'l1', message: 'hi', createdAt: '2026-03-02T00:00:00Z' }]
    PrismaClient().ingestionLog.findMany.mockResolvedValue(fakeLogs)

    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/ingestion/logs').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ logs: fakeLogs })
  })
})
