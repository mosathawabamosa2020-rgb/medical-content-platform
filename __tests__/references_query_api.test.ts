import { createMocks } from 'node-mocks-http'

jest.mock('../lib/db/prisma', () => ({}))
jest.mock('../lib/embeddings', () => ({ embedText: jest.fn() }))
jest.mock('../lib/services/retrieval', () => ({
  RETRIEVAL_POLICY: { MIN_QUERY_LENGTH: 2, MAX_TOP_K: 25 },
  runRetrievalQuery: jest.fn(),
}))

const { runRetrievalQuery } = require('../lib/services/retrieval')

describe('references query API', () => {
  beforeEach(() => jest.clearAllMocks())

  test('rejects topK above hard cap', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { query: 'abc', topK: 999 },
    })

    const handler = require('../pages/api/references/query').default
    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(400)
  })

  test('calls retrieval engine for valid payload', async () => {
    runRetrievalQuery.mockResolvedValue({
      results: [{ id: 'r1', score: 0.9, text: 't', source: 'semantic', reference: { id: 'r1', title: 'x', sourceUrl: null, deviceId: 'd1', uploadedAt: null } }],
      meta: { topK: 5, candidates: 1, fallbackUsed: false, durationMs: 5 },
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: { query: 'ventilator', topK: 5 },
    })

    const handler = require('../pages/api/references/query').default
    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(200)
    expect(runRetrievalQuery).toHaveBeenCalled()
  })
})
