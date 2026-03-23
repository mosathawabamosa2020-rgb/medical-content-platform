describe('embedding fallback observability', () => {
  beforeEach(() => {
    jest.resetModules()
    delete process.env.EMBEDDING_SERVICE_URL
    delete process.env.OPENAI_API_KEY
    delete process.env.OPENAI_EMBEDDING_DIMENSIONS
  })

  test('logs EMBED_FALLBACK_ACTIVATED and increments metric counter', async () => {
    const loggerError = jest.fn()
    jest.doMock('../lib/logger', () => ({
      __esModule: true,
      default: { error: loggerError },
    }))

    const metrics = await import('../lib/observability/metrics')
    metrics.__resetMetricsForTests()
    const { embedText } = await import('../lib/embeddings')

    const vector = await embedText('ventilator troubleshooting')
    expect(vector.length).toBe(1536)
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'EMBED_FALLBACK_ACTIVATED' }),
      expect.stringContaining('EMBED_FALLBACK_ACTIVATED')
    )
    expect(metrics.getEmbeddingFallbackActivatedTotal()).toBe(1)
  })
})
