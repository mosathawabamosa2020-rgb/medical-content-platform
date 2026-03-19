import logger from '../../logger'
import { normalizeRequest } from './normalize'
import { rankAndPackage } from './rank'
import { retrieveVectorCandidates } from './retrieve'
import type { RetrievalDependencies, RetrievalRequestInput, RetrievalResponse } from './types'

export async function runRetrievalQuery(
  input: RetrievalRequestInput,
  deps: RetrievalDependencies
): Promise<RetrievalResponse> {
  const startedAt = Date.now()
  const normalizeStart = Date.now()
  const request = normalizeRequest(input)
  const normalizationMs = Date.now() - normalizeStart
  const embedStart = Date.now()
  const qEmb = await deps.embedder(request.query)
  const embeddingMs = Date.now() - embedStart
  const retrievalTopK = request.topK * request.page
  const { rows: candidates, probe, dbVectorMs, hydrationMs } = await retrieveVectorCandidates(
    deps.prisma,
    qEmb,
    retrievalTopK,
    request.deviceId,
    deps.probe
  )
  const rankStart = Date.now()
  const ranked = rankAndPackage(candidates, retrievalTopK, request.minScore, request.query)
  const rankingMs = Date.now() - rankStart
  const start = (request.page - 1) * request.topK
  const end = start + request.topK
  const serializeStart = Date.now()
  const results = ranked.slice(start, end)
  const serializationMs = Date.now() - serializeStart
  const totalMs = Date.now() - startedAt

  const out: RetrievalResponse = {
    results,
    meta: {
      topK: request.topK,
      page: request.page,
      hasMore: ranked.length > end,
      candidates: candidates.length,
      fallbackUsed: false,
      probeUsed: probe,
      normalizationMs,
      embeddingMs,
      dbVectorMs,
      hydrationMs,
      rankingMs,
      serializationMs,
      totalMs,
      durationMs: totalMs,
    },
  }

  ;(deps.logger || logger).info(
    {
      event: 'retrieval.query',
      topKUsed: request.topK,
      probeUsed: probe,
      resultCount: results.length,
      fallbackUsed: false,
      durationMs: out.meta.durationMs,
      queryLength: request.query.length,
      normalizationMs,
      embeddingMs,
      dbVectorMs,
      hydrationMs,
      rankingMs,
      serializationMs,
    },
    'retrieval query completed'
  )

  return out
}
