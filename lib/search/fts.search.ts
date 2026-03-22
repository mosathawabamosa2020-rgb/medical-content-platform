import prisma from '../db/prisma'

export async function ftsSearch(query: string, limit = 20) {
  return prisma.knowledgeChunk.findMany({
    where: {
      OR: [
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
  })
}


