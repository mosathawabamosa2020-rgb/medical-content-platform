import prisma from '../prisma'

export async function listReferences(deviceId?: string) {
  return prisma.reference.findMany({
    where: deviceId ? { deviceId } : undefined,
    orderBy: { uploadedAt: 'desc' },
  })
}

