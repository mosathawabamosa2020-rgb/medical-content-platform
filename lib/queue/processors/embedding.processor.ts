import { Prisma } from '@prisma/client'
import prisma from '../../db/prisma'
import { embedText } from '../../embeddings'

export async function processEmbeddingJob(chunkId: string, text: string) {
  const vector = await embedText(text)
  const vecSql = Prisma.sql`[${Prisma.join(vector.map((v) => Number(v)))}]`
  await prisma.$executeRaw`
    UPDATE "KnowledgeChunk"
    SET embedding = ${vecSql}::vector
    WHERE id = ${chunkId}
  `
}


