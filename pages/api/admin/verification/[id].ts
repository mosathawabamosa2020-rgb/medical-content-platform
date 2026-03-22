import type { NextApiRequest, NextApiResponse } from 'next'
import { withReviewerOrAdminAuth } from '../../../../lib/middleware/withReviewerOrAdminAuth'
import prisma from '../../../../lib/db/prisma'
import { assertTransition } from '../../../../lib/referenceState'
import type { VerificationDecisionPayload } from '../../../../lib/contracts/api'
import { applyReferenceVerificationDecision } from '../../../../lib/services/verificationService'
import logger from '../../../../lib/logger'
import { writeAuditEvent } from '../../../../lib/auditTrail'

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method !== 'POST' && req.method !== 'PATCH') return res.status(405).end()

  const { decision, comment } = req.body as VerificationDecisionPayload
  if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
    return res.status(400).json({ error: 'invalid decision' })
  }

  try {
    const result = await applyReferenceVerificationDecision(
      prisma as any,
      String(id),
      String(session?.user?.id),
      { decision, comment }
    )
    if (result === 'conflict') {
      return res.status(409).json({ error: 'state conflict' })
    }
  } catch (e: unknown) {
    logger.error({ err: e, referenceId: id }, 'verification transaction failed')
    return res.status(500).json({ error: 'server error' })
  }

  writeAuditEvent({
    event: 'verification.reference.decision',
    actorId: String(session?.user?.id || ''),
    entityType: 'reference',
    entityId: String(id),
    payload: { decision, hasComment: Boolean(comment) },
  })

  try {
    assertTransition('pending_review', decision === 'approved' ? 'verified' : 'rejected')
  } catch (e: unknown) {
    logger.warn({ err: e, referenceId: id }, 'transition assertion failed')
  }

  res.status(200).json({ ok: true })
}

export default withReviewerOrAdminAuth(handler)
