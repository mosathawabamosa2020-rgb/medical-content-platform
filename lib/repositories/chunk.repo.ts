import prisma from '../prisma'

export function findChunkById(id: string) {
  return prisma.knowledgeChunk.findUnique({ where: { id } })
}

