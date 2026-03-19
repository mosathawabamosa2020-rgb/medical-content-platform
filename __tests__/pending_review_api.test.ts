import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => {
  const mPrisma: any = { reference: { findMany: jest.fn(), findUnique: jest.fn() }, $disconnect: jest.fn(), $connect: jest.fn() }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

const { PrismaClient } = require('@prisma/client')

describe('pending review APIs', () => {
  beforeEach(() => jest.clearAllMocks())

  test('list denies non-admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'editor' } })
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/references/pending_review').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(403)
  })

  test('list returns data for admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    PrismaClient().reference.findMany.mockResolvedValue([
      { id: 'r1', title: 't', sourceName: 'PubMed', sourceUrl: null, uploadedAt: new Date(), processingDate: null }
    ])
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/references/pending_review').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toMatchObject({ items: [{ id: 'r1', title: 't', sourceName: 'PubMed' }] })
  })

  test('get reference denies non-admin or missing id', async () => {
    const { getServerSession } = require('next-auth/next') as any
    const handler = require('../pages/api/admin/references/[id]').default

    getServerSession.mockResolvedValue(null)
    let mocks = createMocks({ method: 'GET', query: { id: 'x' } })
    await handler(mocks.req as any, mocks.res as any)
    expect(mocks.res._getStatusCode()).toBe(403)

    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    mocks = createMocks({ method: 'GET' })
    await handler(mocks.req as any, mocks.res as any)
    expect(mocks.res._getStatusCode()).toBe(400)
  })

  test('get reference returns record', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    PrismaClient().reference.findUnique.mockResolvedValue({ id: 'r2', title: 'x' })
    const { req, res } = createMocks({ method: 'GET', query: { id: 'r2' } })
    const handler = require('../pages/api/admin/references/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ id: 'r2', title: 'x' })
  })
})
