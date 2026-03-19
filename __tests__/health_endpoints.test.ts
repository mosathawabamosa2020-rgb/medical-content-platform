import { createMocks } from 'node-mocks-http'

// import handlers
import systemHandler from '../pages/api/health/system'
import databaseHandler from '../pages/api/health/database'

// mock prisma and logger for database endpoint
jest.mock('@prisma/client', () => {
  const mPrisma = {
    $queryRaw: jest.fn(),
    $disconnect: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

import logger from '../lib/logger'
jest.mock('../lib/logger')

describe('health endpoints', () => {
  test('/api/health/system returns ok', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await systemHandler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ status: 'ok' })
  })

  test('/api/health/system rejects other methods', async () => {
    const { req, res } = createMocks({ method: 'POST' })
    await systemHandler(req as any, res as any)
    expect(res._getStatusCode()).toBe(405)
  })

  test('/api/health/database returns ok when query succeeds', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    const { PrismaClient } = require('@prisma/client')
    PrismaClient().$queryRaw.mockResolvedValue(1)
    await databaseHandler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ status: 'ok' })
  })

  test('/api/health/database returns error when query fails', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    const { PrismaClient } = require('@prisma/client')
    PrismaClient().$queryRaw.mockRejectedValue(new Error('nope'))
    await databaseHandler(req as any, res as any)
    expect(res._getStatusCode()).toBe(503)
    expect(JSON.parse(res._getData())).toEqual({ status: 'error' })
  })

  test('/api/health/database rejects non-GET', async () => {
    const { req, res } = createMocks({ method: 'DELETE' })
    await databaseHandler(req as any, res as any)
    expect(res._getStatusCode()).toBe(405)
  })
})
