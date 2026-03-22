import prisma from '../db/prisma'

export function findChunkById(id: string) {
  return prisma.knowledgeChunk.findUnique({ where: { id } })
}


