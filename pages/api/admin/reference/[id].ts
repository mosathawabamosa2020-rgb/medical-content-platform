import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/adminAuth'
import prisma from '../../../../lib/prisma'
import type { ReferenceDetailResponse, VerificationDecisionPayload } from '../../../../lib/contracts/api'
import { applyReferenceVerificationDecision } from '../../../../lib/services/verificationService'
import logger from '../../../../lib/logger'

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method === 'GET') {
    const ref = await prisma.reference.findUnique({ where: { id: String(id) } })
    if (!ref) return res.status(404).json({ error: 'not found' })
    const payload: ReferenceDetailResponse = {
      ...ref,
      uploadedAt: ref.uploadedAt.toISOString(),
      processingDate: ref.processingDate ? ref.processingDate.toISOString() : null,
    }
    return res.status(200).json(payload)
  }

  if (req.method === 'PATCH') {
    const body = req.body as VerificationDecisionPayload
    if (!body.decision || (body.decision !== 'approved' && body.decision !== 'rejected')) {
      return res.status(400).json({ error: 'invalid decision' })
    }
    try {
      const status = await applyReferenceVerificationDecision(
        prisma as any,
        String(id),
        String(session?.user?.id),
        body
      )
      if (status === 'conflict') return res.status(409).json({ error: 'state conflict' })
      const ref = await prisma.reference.findUnique({ where: { id: String(id) } })
      if (!ref) return res.status(404).json({ error: 'not found' })
      const payload: ReferenceDetailResponse = {
        ...ref,
        uploadedAt: ref.uploadedAt.toISOString(),
        processingDate: ref.processingDate ? ref.processingDate.toISOString() : null,
      }
      return res.status(200).json(payload)
    } catch (err: unknown) {
      logger.error({ err, referenceId: id }, 'reference patch failed')
      return res.status(500).json({ error: 'server error' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
