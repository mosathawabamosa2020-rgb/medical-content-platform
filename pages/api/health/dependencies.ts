import type { NextApiRequest, NextApiResponse } from 'next'
import { getReadinessSnapshot } from '../../../lib/ops/readiness'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })

  const snapshot = await getReadinessSnapshot()
  return res.status(200).json({ status: snapshot.overallStatus, dependencies: snapshot.checks, summary: snapshot.summary })
}
