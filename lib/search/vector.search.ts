import { Prisma } from '@prisma/client'
import prisma from '../db/prisma'
import { embedText } from '../embeddings'

export async function vectorSearch(query: string, limit = 20) {
  const vector = await embedText(query)
  const vecSql = Prisma.sql`[${Prisma.join(vector.map((v) => Number(v)))}]`
  const boundedLimit = Math.max(1, Math.min(200, limit))
  return prisma.$queryRaw<any[]>`
    SELECT kc.id, kc.content, kc."referenceId"
    FROM "KnowledgeChunk" kc
    WHERE kc.embedding IS NOT NULL
    ORDER BY kc.embedding <=> ${vecSql}::vector
    LIMIT ${boundedLimit}
  `
}


