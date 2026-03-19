import prisma from '../prisma'

export async function writeAudit(action: string, payload?: string, actorId?: string, referenceId?: string) {
  const data: any = { action, payload, actorId }
  if (referenceId) data.reference = { connect: { id: referenceId } }
  return prisma.auditLog.create({
    data,
  })
}
