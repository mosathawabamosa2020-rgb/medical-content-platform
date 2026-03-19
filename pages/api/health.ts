import type { NextApiRequest, NextApiResponse } from 'next'
import { getReadinessSnapshot } from '../../lib/ops/readiness'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  const snapshot = await getReadinessSnapshot()
  const httpStatus = snapshot.overallStatus === 'blocked' ? 503 : 200

  return res.status(httpStatus).json({
    status: snapshot.overallStatus,
    model: {
      liveness: '/api/health/system',
      readiness: '/api/health',
      dependencies: '/api/health/dependencies',
    },
    readiness: snapshot.overallStatus,
    checks: snapshot.checks,
    summary: snapshot.summary,
  })
}
