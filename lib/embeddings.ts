import logger from './logger'
import prisma from './db/prisma'

const DEFAULT_DIM = 1536

function getEmbeddingDimension(): number {
  const phase2 = Boolean(process.env.EMBEDDING_SERVICE_URL)
  const raw = Number(
    phase2
      ? process.env.EMBEDDING_DIMENSIONS || 1024
      : process.env.OPENAI_EMBEDDING_DIMENSIONS || DEFAULT_DIM
  )
  if (Number.isNaN(raw) || raw < 64) return phase2 ? 1024 : DEFAULT_DIM
  return Math.floor(raw)
}

function zeroVector(dim = getEmbeddingDimension()): number[] {
  return Array.from({ length: dim }, () => 0)
}

async function embedWithPhase2Service(text: string): Promise<number[]> {
  const endpoint = process.env.EMBEDDING_SERVICE_URL
  if (!endpoint) throw new Error('embedding_service_missing')
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: [text], model: process.env.EMBEDDING_MODEL || 'BAAI/bge-m3' }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`embedding_service_failed:${response.status}`)
  const json = await response.json()
  const embeddings = json?.embeddings
  if (!Array.isArray(embeddings) || !Array.isArray(embeddings[0])) {
    throw new Error('embedding_service_invalid')
  }
  return embeddings[0].map((x: unknown) => Number(x))
}

async function embedWithOpenAI(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) throw new Error('openai_key_missing')
  const OpenAI = await import('openai')
  const openai = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    input: text,
    dimensions: getEmbeddingDimension(),
  })
  const first = response.data[0]
  if (!first || !Array.isArray(first.embedding)) throw new Error('openai_embed_invalid')
  return first.embedding.map((x) => Number(x))
}

export async function embedText(text: string): Promise<number[]> {
  try {
    if (process.env.EMBEDDING_SERVICE_URL) return await embedWithPhase2Service(text)
    return await embedWithOpenAI(text)
  } catch (err) {
    logger.error({ err }, 'EMBEDDING_FALLBACK: zero vector returned; retrieval quality will degrade')
    return zeroVector()
  }
}

export async function saveSectionEmbedding(sectionId: string, embedding: number[]) {
  const vecLiteral = `[${embedding.map((n) => Number(n)).join(',')}]`
  return prisma.$executeRaw`
    UPDATE "Section"
    SET embedding = ${vecLiteral}::vector
    WHERE id = ${sectionId}
  `
}

export async function queryVectors(queryEmbedding: number[], topK = 5) {
  const vecLiteral = `[${queryEmbedding.map((n) => Number(n)).join(',')}]`
  const safeTopK = Math.max(1, Math.min(100, Math.floor(topK)))
  return prisma.$queryRaw<any[]>`
    SELECT
      s.id as "sectionId",
      s."referenceId" as "referenceId",
      s.content as "pageContent",
      r."deviceId" as "deviceId",
      s.order as "page",
      1 - (s.embedding <=> ${vecLiteral}::vector) as similarity
    FROM "Section" s
    JOIN "Reference" r ON r.id = s."referenceId"
    WHERE s.embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ${safeTopK}
  `
}
