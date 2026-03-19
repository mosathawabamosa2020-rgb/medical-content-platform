import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    reference: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

const { PrismaClient } = require('@prisma/client')

describe('library API', () => {
  beforeEach(() => jest.clearAllMocks())

  test('valid pagination returns items and total', async () => {
    PrismaClient().reference.findMany.mockImplementation(({ where }) => {
      // ensure filter includes verified status and sections.some
      expect(where).toMatchObject({ status: 'verified', sections: { some: {} } })
      return Promise.resolve([{ id: 'r1', title: 'T', authors: 'A', journal: 'J', pmid: null }])
    })
    PrismaClient().reference.count.mockImplementation(({ where }) => {
      expect(where).toMatchObject({ status: 'verified', sections: { some: {} } })
      return Promise.resolve(1)
    })
    const { req, res } = createMocks({ method: 'GET', query: { page: '2', limit: '5' } })
    const handler = require('../pages/api/references/library').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toEqual({ items: [{ id: 'r1', title: 'T', authors: 'A', journal: 'J', pmid: null }], total: 1, page: 2, limit: 5 })
  })

  test('bad pagination returns 400', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { page: 'x', limit: '-1' } })
    const handler = require('../pages/api/references/library').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('method not allowed', async () => {
    const { req, res } = createMocks({ method: 'POST' })
    const handler = require('../pages/api/references/library').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(405)
  })
})