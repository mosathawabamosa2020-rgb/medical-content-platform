import type { PrismaClient } from '@prisma/client'
import type { VerificationDecisionPayload } from '../contracts/api'

export async function applyReferenceVerificationDecision(
  prisma: PrismaClient,
  referenceId: string,
  reviewerId: string,
  payload: VerificationDecisionPayload
): Promise<'ok' | 'conflict'> {
  try {
    await prisma.$transaction(async (tx) => {
      const update = await tx.reference.updateMany({
        where: { id: referenceId, status: 'pending_review' },
        data: { status: payload.decision === 'approved' ? 'verified' : 'rejected' },
      })
      if (update.count === 0) {
        throw new Error('state_conflict')
      }
      await tx.verificationLog.create({
        data: {
          referenceId,
          reviewerId,
          decision: payload.decision,
          comment: payload.comment || null,
        },
      })
    })
    return 'ok'
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'state_conflict') return 'conflict'
    throw err
  }
}
