import type { NextApiRequest, NextApiResponse } from 'next'
import { withReviewerOrAdminAuth } from '../../../../lib/middleware/withReviewerOrAdminAuth'
import prisma from '../../../../lib/db/prisma'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method === 'GET') {
    const ref = await prisma.reference.findUnique({ where: { id: String(id) } })
    if (!ref) return res.status(404).json({ error: 'not found' })
    return res.status(200).json(ref)
  }
  res.status(405).end()
}

export default withReviewerOrAdminAuth(handler)
