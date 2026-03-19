import { RETRIEVAL_POLICY, runRetrievalQuery } from '../lib/services/retrieval'

describe('retrieval engine', () => {
  test('uses semantic path and enforces verified-only SQL clause', async () => {
    const seenSql: string[] = []
    const tx = {
      $executeRawUnsafe: jest.fn(() => Promise.resolve(1)),
      $queryRaw: jest.fn((strings: TemplateStringsArray) => {
        seenSql.push(strings.join(' '))
        return Promise.resolve([
          {
            id: 'r1',
            referenceId: 'ref1',
            pageContent: 'verified content for cardiac monitor',
            deviceId: 'd1',
            similarity: 0.9,
            sourceReliabilityScore: 0.8,
            uploadedAt: new Date(),
            sourceUrl: 'https://example.com',
            title: 'Ref 1',
          },
        ])
      }),
    }
    const prisma = {
      $transaction: jest.fn(async (fn: any) => fn(tx)),
      $queryRawUnsafe: jest.fn(() =>
        Promise.resolve([
          {
            id: 'r1',
            referenceId: 'ref1',
            pageContent: 'verified content for cardiac monitor',
            deviceId: 'd1',
            sourceReliabilityScore: 0.8,
            uploadedAt: new Date(),
            sourceUrl: 'https://example.com',
            title: 'Ref 1',
          },
        ])
      ),
    }

    const out = await runRetrievalQuery(
      { query: 'cardiac monitor', topK: 3 },
      { prisma, embedder: async () => [0.1, 0.2, 0.3] }
    )

    expect(out.meta.fallbackUsed).toBe(false)
    expect(out.results.length).toBe(1)
    expect(out.results[0].source).toBe('semantic')
    expect(seenSql[0]).toContain("status = 'verified'")
  })

  test('throws when embedding fails (no unsafe keyword fallback)', async () => {
    const prisma = { $transaction: jest.fn() }
    await expect(
      runRetrievalQuery(
        { query: 'pump failure', topK: 2 },
        { prisma, embedder: async () => { throw new Error('embed error') } }
      )
    ).rejects.toThrow('embed error')
    expect(RETRIEVAL_POLICY.MAX_TOP_K).toBe(25)
  })
})
