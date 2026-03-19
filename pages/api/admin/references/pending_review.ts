import type { NextApiRequest, NextApiResponse } from 'next'
import { withReviewerOrAdminAuth } from '../../../../lib/adminAuth'
import prisma from '../../../../lib/prisma'
import type { PendingReviewListResponse, ReferenceDetailResponse } from '../../../../lib/contracts/api'
import logger from '../../../../lib/logger'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const refs = await prisma.reference.findMany({ where: { status: 'pending_review' }, orderBy: { uploadedAt: 'desc' } })
    const items: ReferenceDetailResponse[] = refs.map((ref) => ({
      ...ref,
      uploadedAt: ref.uploadedAt ? ref.uploadedAt.toISOString() : new Date(0).toISOString(),
      processingDate: ref.processingDate ? ref.processingDate.toISOString() : null,
    }))
    const payload: PendingReviewListResponse = { items }
    return res.status(200).json(payload)
  } catch (err: unknown) {
    logger.error({ err }, 'pending review query failed')
    return res.status(500).json({ error: 'server error' })
  }
}

export default withReviewerOrAdminAuth(handler)
