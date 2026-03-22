import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../lib/db/prisma'
import { embedText } from '../../../lib/embeddings'
import { RETRIEVAL_POLICY, runRetrievalQuery } from '../../../lib/services/retrieval'
import type { RetrievalQueryInput } from '../../../lib/contracts/api'
import { enforceRateLimit, setSecurityHeaders } from '../../../lib/apiSecurity'

const querySchema = z.object({
  query: z.string().min(RETRIEVAL_POLICY.MIN_QUERY_LENGTH),
  deviceId: z.string().min(1).optional(),
  topK: z.number().int().positive().max(RETRIEVAL_POLICY.MAX_TOP_K).optional(),
  page: z.number().int().positive().max(RETRIEVAL_POLICY.MAX_PAGE).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setSecurityHeaders(res)
  if (!enforceRateLimit(req, res, 'references-query', 60_000, 90)) return
  if (req.method !== 'POST') return res.status(405).end()
  const parsed = querySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })
  }

  try {
    const input: RetrievalQueryInput = parsed.data
    const output = await runRetrievalQuery(input, {
      prisma,
      embedder: embedText,
    })
    return res.status(200).json(output)
  } catch (err: any) {
    const logger = require('../../../lib/logger').default || require('../../../lib/logger')
    logger.error(
      {
        event: 'retrieval.query.error',
        failureCode: 'retrieval_query_failed',
        retryCount: 0,
        topKUsed: parsed.data.topK || RETRIEVAL_POLICY.DEFAULT_TOP_K,
        probeUsed: Number(process.env.RETRIEVAL_IVFFLAT_PROBES || RETRIEVAL_POLICY.DEFAULT_IVFFLAT_PROBES),
        error: err?.message || String(err),
      },
      'retrieval query failed'
    )
    return res.status(500).json({ error: 'Query failed', failureCode: 'retrieval_query_failed' })
  }
}
