import { RETRIEVAL_POLICY, clampTopK, normalizeRequest } from '../lib/services/retrieval'

describe('retrieval policy normalization', () => {
  test('clamps topK to hard cap', () => {
    expect(clampTopK(999)).toBe(RETRIEVAL_POLICY.MAX_TOP_K)
  })

  test('normalizes whitespace and default topK', () => {
    const n = normalizeRequest({ query: '  a   b  ' })
    expect(n.query).toBe('a b')
    expect(n.topK).toBe(RETRIEVAL_POLICY.DEFAULT_TOP_K)
  })
})
