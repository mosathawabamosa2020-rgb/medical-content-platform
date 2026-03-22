import { createMocks } from 'node-mocks-http'

jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }))
jest.mock('../lib/sources/pubmed.adapter', () => {
  return jest.fn().mockImplementation(() => ({ search: jest.fn() }))
})

const PubMedAdapter = require('../lib/sources/pubmed.adapter')

describe('search pubmed API', () => {
  beforeEach(() => jest.clearAllMocks())

  test('requires term query', async () => {
    const { req, res } = createMocks({ method: 'GET', query: {} })
    const handler = require('../pages/api/search/pubmed').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('returns results and caches', async () => {
    const fake = [{ id: '1', title: 'T' }]
    PubMedAdapter.mockImplementation(() => ({ search: jest.fn().mockResolvedValue(fake) }))

    const { req, res } = createMocks({ method: 'GET', query: { term: 'foo' } })
    const handler = require('../pages/api/search/pubmed').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData()).results).toEqual(fake)
  })
})
