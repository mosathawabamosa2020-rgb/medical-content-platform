import { createMocks } from 'node-mocks-http'

const lookup = jest.fn()
const fetch = jest.fn()
const deriveSourceIdentifiers = jest.fn()

jest.mock('node:dns/promises', () => ({
  __esModule: true,
  default: { lookup },
}))

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: fetch,
}))

jest.mock('../lib/apiSecurity', () => ({
  enforceCsrfForMutation: () => true,
  enforceRateLimit: () => true,
  setSecurityHeaders: () => undefined,
}))

jest.mock('../lib/db/prisma', () => ({
  __esModule: true,
  default: {
    reference: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    ingestionLog: { create: jest.fn() },
  },
}))

jest.mock('../lib/sourceIdentifiers', () => ({
  deriveSourceIdentifiers: (...args: any[]) => deriveSourceIdentifiers(...args),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => ({ user: { id: 'u1', role: 'admin' } })),
}))

describe('discovery ingest duplicates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    lookup.mockResolvedValue([{ address: '93.184.216.34' }])
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/html' },
      text: async () => '<html>hello</html>',
    })
    ;(global as any).fetch = fetch
  })

  test('returns 409 on duplicate by identifiers', async () => {
    deriveSourceIdentifiers.mockReturnValue({ pmid: 'pmid1' })
    const prisma = require('../lib/db/prisma').default
    prisma.reference.findFirst.mockResolvedValue({ id: 'dup1' })

    const { req, res } = createMocks({
      method: 'POST',
      body: { url: 'https://example.org/doc', deviceId: 'd1', title: 'T' },
      headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
    })
    const handler = require('../pages/api/references/discovery/ingest').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(409)
    expect(JSON.parse(res._getData()).error).toBe('duplicate source identifiers')
  })

  test('returns 409 on duplicate by content hash', async () => {
    deriveSourceIdentifiers.mockReturnValue({})
    const prisma = require('../lib/db/prisma').default
    prisma.reference.findFirst.mockResolvedValue({ id: 'dup2' })

    const { req, res } = createMocks({
      method: 'POST',
      body: { url: 'https://example.org/doc2', deviceId: 'd1', title: 'T2' },
      headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
    })
    const handler = require('../pages/api/references/discovery/ingest').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(409)
    expect(JSON.parse(res._getData()).error).toBe('duplicate content')
  })
})
