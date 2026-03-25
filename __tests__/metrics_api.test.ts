import { createMocks } from 'node-mocks-http'

jest.mock('../lib/observability/metrics', () => ({
  getQueueDepthSnapshot: jest.fn(async () => ({
    queue_depth_pdf: 2,
    queue_depth_embed: 3,
    queue_depth_search: 5,
  })),
  getRetrievalLatencySnapshot: jest.fn(() => ({
    retrieval_latency_ms_p50: 42,
    retrieval_latency_ms_p95: 95,
  })),
  getEmbeddingFallbackActivatedTotal: jest.fn(() => 7),
  getApiErrorRate: jest.fn(() => 0),
  buildPrometheusMetricsText: jest.fn(() => [
    'queue_depth_pdf 2',
    'queue_depth_embed 3',
    'queue_depth_search 5',
    'retrieval_latency_ms_p50 42',
    'retrieval_latency_ms_p95 95',
    'api_error_rate 0',
    'embedding_fallback_activated_total 7',
  ].join('\n')),
}))

describe('/api/metrics', () => {
  test('returns prometheus metrics payload', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/metrics').default
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const body = res._getData()
    expect(body).toContain('queue_depth_pdf')
    expect(body).toContain('queue_depth_embed')
    expect(body).toContain('queue_depth_search')
    expect(body).toContain('retrieval_latency_ms_p50')
    expect(body).toContain('retrieval_latency_ms_p95')
    expect(body).toContain('api_error_rate')
    expect(body).toContain('embedding_fallback_activated_total')
  })

  test('returns 405 on non-GET', async () => {
    const { req, res } = createMocks({ method: 'POST' })
    const handler = require('../pages/api/metrics').default
    await handler(req, res)
    expect(res._getStatusCode()).toBe(405)
  })
})
