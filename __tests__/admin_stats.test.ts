import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    reference: { count: jest.fn() },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  // expose minimal enum so ReferenceStatus.pending_ingestion works
  const ReferenceStatus = {
    pending_ingestion: 'pending_ingestion',
    pending_review: 'pending_review',
    verified: 'verified'
  }
  return { PrismaClient: jest.fn(() => mPrisma), ReferenceStatus }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

const { PrismaClient } = require('@prisma/client')

describe('admin stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('denies non-admin users', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'editor' } })

    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/stats').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(403)
  })

  test('returns counts for admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })

    PrismaClient().reference.count.mockImplementation(({ where }) => {
      if (where.status === 'pending_ingestion') return Promise.resolve(7)
      if (where.status === 'pending_review') return Promise.resolve(3)
      if (where.status === 'verified') return Promise.resolve(11)
      return Promise.resolve(0)
    })

    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/stats').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ ingestedCount: 7, verificationCount: 3, knowledgeLibraryCount: 11 })
  })
})
