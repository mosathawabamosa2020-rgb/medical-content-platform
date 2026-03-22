import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import { ensureSchedulersStarted } from '../../../../lib/queue/queues'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  await ensureSchedulersStarted()
  return res.status(200).json({ ok: true, schedule: '48h' })
}

export default withAdminAuth(handler)

