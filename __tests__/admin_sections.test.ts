import { createMocks } from 'node-mocks-http'

type PrismaMock = any

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    section: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), groupBy: jest.fn(), count: jest.fn() },
    reference: { count: jest.fn() },
    device: { count: jest.fn() },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn(async () => ({ user: { id: 'u1', role: 'admin' } })) }))

const { PrismaClient } = require('@prisma/client')

describe('admin sections API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('queue returns ingested sections', async () => {
    const fake = [{ id: '1', title: 'T', content: 'C', reference: { id: 'r1', filePath: '/u/f.pdf' } }]
    PrismaClient().section.findMany.mockResolvedValue(fake)

    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/sections/queue').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ sections: fake })
  })

  test('detail GET returns single section', async () => {
    const fake = { id: '1', title: 'T', content: 'C', reference: { id: 'r1' } }
    PrismaClient().section.findUnique.mockResolvedValue(fake)

    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } })
    const handler = require('../pages/api/admin/sections/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(fake)
  })


  test('metrics returns counts', async () => {
    PrismaClient().device.count.mockResolvedValue(5)
    PrismaClient().reference.count.mockResolvedValue(10)
    PrismaClient().section.count.mockResolvedValue(20)
    PrismaClient().section.groupBy.mockResolvedValue([])

    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/metrics').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toMatchObject({ deviceCount: 5, articleCount: 10, sectionCount: 20 })
  })
})
