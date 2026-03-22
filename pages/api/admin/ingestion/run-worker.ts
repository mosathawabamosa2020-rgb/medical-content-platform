import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import { enqueueIngestionJob, ensureSchedulersStarted } from '../../../../lib/queue/queues'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  await ensureSchedulersStarted()
  const result = await enqueueIngestionJob('api_manual_trigger')
  return res.status(202).json({ status: 'accepted', queueMode: result.mode, jobId: result.id })
}

export default withAdminAuth(handler)

