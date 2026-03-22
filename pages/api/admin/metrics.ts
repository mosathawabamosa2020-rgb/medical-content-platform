import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../lib/middleware/withAdminAuth'

const { computeMetrics } = require('../../../lib/services/MetricsService')

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const m = await computeMetrics()
    return res.status(200).json(m)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
}

export default withAdminAuth(handler)
