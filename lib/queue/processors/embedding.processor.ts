import prisma from '../../db/prisma'
import { embedText } from '../../embeddings'

export async function processEmbeddingJob(chunkId: string, text: string) {
  const vector = await embedText(text)
  const vecLiteral = `[${vector.map((v) => Number(v)).join(',')}]`
  await prisma.$executeRaw`
    UPDATE "KnowledgeChunk"
    SET embedding = ${vecLiteral}::vector
    WHERE id = ${chunkId}
  `
}


