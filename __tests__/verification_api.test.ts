import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    reference: { updateMany: jest.fn() },
    verificationLog: { create: jest.fn() },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  const ReferenceStatus = {
    pending_review: 'pending_review',
    verified: 'verified',
    rejected: 'rejected'
  }
  return { PrismaClient: jest.fn(() => mPrisma), ReferenceStatus }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

const { PrismaClient } = require('@prisma/client')

describe('reference verification API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const prisma = PrismaClient()
    prisma.$transaction = jest.fn().mockImplementation(async (cb: any) => cb(prisma))
  })

  test('blocks non-admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'editor' } })
    const { req, res } = createMocks({ method: 'POST', query: { id: 'abc' } })
    const handler = require('../pages/api/admin/verification/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(403)
  })

  test('requires decision', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin', id: 'user1' } })
    const { req, res } = createMocks({ method: 'POST', query: { id: 'x' }, body: {} })
    const handler = require('../pages/api/admin/verification/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('conflict when status changed', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin', id: 'u' } })
    PrismaClient().reference.updateMany.mockResolvedValue({ count: 0 })
    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'r1' },
      body: { decision: 'approved' }
    })
    const handler = require('../pages/api/admin/verification/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(409)
  })

  test('successful approval logs entry', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin', id: 'u2' } })
    PrismaClient().reference.updateMany.mockResolvedValue({ count: 1 })
    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'r2' },
      body: { decision: 'approved', comment: 'looks good' }
    })
    const handler = require('../pages/api/admin/verification/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(PrismaClient().verificationLog.create).toHaveBeenCalledWith({ data: {
      referenceId: 'r2',
      reviewerId: 'u2',
      decision: 'approved',
      comment: 'looks good'
    } })
  })

  test('rolls back on log failure', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin', id: 'u3' } })
    const updateMock = jest.fn().mockResolvedValue({ count: 1 })
    const createMock = jest.fn().mockRejectedValue(new Error('db fail'))
    PrismaClient().$transaction = jest.fn().mockImplementation(async (cb: any) => {
      return cb({ reference: { updateMany: updateMock }, verificationLog: { create: createMock } })
    })

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'r3' },
      body: { decision: 'rejected' }
    })
    const handler = require('../pages/api/admin/verification/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(500)
    expect(updateMock).toHaveBeenCalled()
    expect(createMock).toHaveBeenCalled()
  })
})
