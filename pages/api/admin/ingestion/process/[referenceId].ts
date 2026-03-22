import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../../lib/middleware/withAdminAuth'
import { processReferenceById } from '../../../../../lib/workers/ingestionWorker'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { referenceId } = req.query
  if (!referenceId || Array.isArray(referenceId)) return res.status(400).json({ error: 'invalid id' })

  // trigger processing asynchronously
  processReferenceById(referenceId).then(result => console.log('processed', result)).catch(err => console.error('process failed', err))

  return res.status(202).json({ status: 'accepted' })
}

export default withAdminAuth(handler)
