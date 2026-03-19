import prisma from '../prisma'

export function findReferenceById(id: string) {
  return prisma.reference.findUnique({ where: { id } })
}

