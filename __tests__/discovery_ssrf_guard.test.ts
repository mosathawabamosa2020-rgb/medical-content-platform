import { createMocks } from 'node-mocks-http'

const lookup = jest.fn()

jest.mock('node:dns/promises', () => ({
  __esModule: true,
  default: { lookup },
}))

jest.mock('../lib/apiSecurity', () => ({
  enforceCsrfForMutation: () => true,
  enforceRateLimit: () => true,
  setSecurityHeaders: () => undefined,
}))

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    reference: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    ingestionLog: { create: jest.fn() },
  },
}))

describe('discovery ingest SSRF hardening', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    lookup.mockResolvedValue([{ address: '93.184.216.34' }])
  })

  test('blocks localhost hostname', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { url: 'http://localhost:3000', deviceId: 'd1' },
      headers: { host: 'localhost:3000' },
    })
    const handler = require('../pages/api/references/discovery/ingest').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('blocks private IP direct url', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { url: 'http://10.1.2.3/data', deviceId: 'd1' },
      headers: { host: 'localhost:3000' },
    })
    const handler = require('../pages/api/references/discovery/ingest').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('blocks resolved private IP', async () => {
    lookup.mockResolvedValue([{ address: '10.10.1.2' }])
    const { req, res } = createMocks({
      method: 'POST',
      body: { url: 'https://example.org/path', deviceId: 'd1' },
      headers: { host: 'localhost:3000' },
    })
    const handler = require('../pages/api/references/discovery/ingest').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })
})
