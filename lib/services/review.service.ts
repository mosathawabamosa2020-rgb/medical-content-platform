import prisma from '../prisma'

export async function listPendingReview() {
  return prisma.reference.findMany({ where: { status: 'pending_review' }, orderBy: { uploadedAt: 'desc' } })
}

