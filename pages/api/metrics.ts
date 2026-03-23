import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildPrometheusMetricsText,
  getEmbeddingFallbackActivatedTotal,
  getQueueDepthSnapshot,
  getRetrievalLatencySnapshot,
} from '../../lib/observability/metrics'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const [queues, retrieval] = await Promise.all([getQueueDepthSnapshot(), Promise.resolve(getRetrievalLatencySnapshot())])
  const payload = buildPrometheusMetricsText({
    ...queues,
    ...retrieval,
    embedding_fallback_activated_total: getEmbeddingFallbackActivatedTotal(),
  })

  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(`${payload}\n`)
}
