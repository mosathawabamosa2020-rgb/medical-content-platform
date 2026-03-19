import prisma from '../../prisma'
import { embedText } from '../../embeddings'

export async function processEmbeddingJob(chunkId: string, text: string) {
  const vector = await embedText(text)
  await prisma.$executeRawUnsafe(
    `UPDATE "KnowledgeChunk" SET embedding = $1::vector WHERE id = $2`,
    `[${vector.join(',')}]`,
    chunkId
  )
}

