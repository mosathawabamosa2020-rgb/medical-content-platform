import { createMocks } from 'node-mocks-http'

// mock Prisma to avoid hitting real DB
jest.mock('@prisma/client', () => {
  const mPrisma = {
    section: {
      findMany: jest.fn()
    },
    knowledgeChunk: {
      findMany: jest.fn()
    },
    $disconnect: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

import handler from '../pages/api/devices/[deviceId]/profile'

describe('profile API', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns sections when available', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { deviceId: 'dev1' } })
    const fakeSections = [
      { title: 'A', content: '1' },
      { title: 'B', content: '2' }
    ]
    const { PrismaClient } = require('@prisma/client')
    PrismaClient().section.findMany.mockResolvedValue(fakeSections)

    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.profile).toEqual({ A: { content: '1' }, B: { content: '2' } })
    expect(PrismaClient().section.findMany).toHaveBeenCalledWith({ where: { deviceId: 'dev1' }, orderBy: { order: 'asc' } })
  })

  test('falls back to knowledge chunks when no sections', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { deviceId: 'dev2' } })
    const { PrismaClient } = require('@prisma/client')
    PrismaClient().section.findMany.mockResolvedValue([])
    PrismaClient().knowledgeChunk.findMany.mockResolvedValue([
      { id: '1', content: 'C', category: 'Cat', pageNumber: 3 }
    ])

    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.profile).toHaveProperty('Cat')
    expect(data.profile.Cat[0]).toEqual({ id: '1', content: 'C', category: 'Cat', pageNumber: 3 })
  })
})
