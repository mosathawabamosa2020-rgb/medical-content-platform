import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    reference: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

const { PrismaClient } = require('@prisma/client')

describe('ingestion import API', () => {
  beforeEach(() => jest.clearAllMocks())

  test('rejects non-post methods', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/ingestion/import').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(405)
  })

  test('forbids non-admin', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'editor' } })

    const { req, res } = createMocks({ method: 'POST', body: {} })
    const handler = require('../pages/api/admin/ingestion/import').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(403)
  })

  test('validates required fields', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })

    const { req, res } = createMocks({ method: 'POST', body: { foo: 'bar' } })
    const handler = require('../pages/api/admin/ingestion/import').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('prevents duplicates', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })

    const existing = { id: 'r1' }
    PrismaClient().reference.findFirst.mockResolvedValue(existing)

    const body = { deviceId: 'd1', pmid: 'p1', title: 'T1' }
    const { req, res } = createMocks({ method: 'POST', body })
    const handler = require('../pages/api/admin/ingestion/import').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(409)
    expect(JSON.parse(res._getData())).toEqual({ error: 'duplicate', referenceId: 'r1' })
  })

  test('creates reference and returns id on success', async () => {
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })

    PrismaClient().reference.findFirst.mockResolvedValue(null)
    PrismaClient().reference.create.mockResolvedValue({ id: 'new1' })
    PrismaClient().reference.update.mockResolvedValue({})

    const body = { deviceId: 'd1', pmid: 'p2', title: 'T2', sourceUrl: 'u' }
    const { req, res } = createMocks({ method: 'POST', body })
    const handler = require('../pages/api/admin/ingestion/import').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual({ referenceId: 'new1' })
  })
})