import prisma from '../db/prisma'

export async function listChunksByReference(referenceId: string) {
  return prisma.knowledgeChunk.findMany({ where: { referenceId }, orderBy: { pageNumber: 'asc' } })
}


