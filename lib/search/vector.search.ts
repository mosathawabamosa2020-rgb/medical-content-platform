import prisma from '../db/prisma'
import { embedText } from '../embeddings'

export async function vectorSearch(query: string, limit = 20) {
  const vector = await embedText(query)
  const literal = `[${vector.join(',')}]`
  return prisma.$queryRawUnsafe<any[]>(
    `
    SELECT kc.id, kc.content, kc."referenceId"
    FROM "KnowledgeChunk" kc
    WHERE kc.embedding IS NOT NULL
    ORDER BY kc.embedding <=> $1::vector
    LIMIT $2
    `,
    literal,
    limit
  )
}


