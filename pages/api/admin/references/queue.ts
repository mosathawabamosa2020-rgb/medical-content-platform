import type { NextApiRequest, NextApiResponse } from 'next'
import { withReviewerOrAdminAuth } from '../../../../lib/middleware/withReviewerOrAdminAuth'
import prisma from '../../../../lib/db/prisma'
import { ReferenceStatus } from '@prisma/client'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const refs = await prisma.reference.findMany({ where: { status: ReferenceStatus.pending_review }, orderBy: { uploadedAt: 'desc' } })
    return res.status(200).json({ items: refs })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
}

export default withReviewerOrAdminAuth(handler)
