import prisma from './prisma'

const DEFAULT_EMBEDDING_DIMENSION = 1536

function normalizeL2(vec: number[]) {
  let sum = 0
  for (const v of vec) sum += v * v
  const norm = Math.sqrt(sum) || 1
  return vec.map((v) => v / norm)
}

function getEmbeddingDimension(): number {
  const raw = Number(process.env.EMBEDDING_DIMENSION || DEFAULT_EMBEDDING_DIMENSION)
  if (Number.isNaN(raw) || raw < 64) return DEFAULT_EMBEDDING_DIMENSION
  return Math.floor(raw)
}

function assertEmbeddingDimension(embedding: number[], source: string): void {
  const expected = getEmbeddingDimension()
  if (embedding.length !== expected) {
    throw new Error(`embedding dimension mismatch from ${source}: expected ${expected}, got ${embedding.length}`)
  }
}

// Deterministic free-tier fallback embedding (no external API dependency).
function localDeterministicEmbedding(text: string, dim = getEmbeddingDimension()): number[] {
  const out = new Array<number>(dim).fill(0)
  const input = (text || '').toLowerCase()
  let seed = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    seed ^= input.charCodeAt(i)
    seed = Math.imul(seed, 16777619)
    const idx = Math.abs(seed) % dim
    const prev = out[idx] ?? 0
    out[idx] = prev + (((seed >>> 0) % 2000) / 1000 - 1)
  }
  return normalizeL2(out)
}

// Server-side embedding adapter with deterministic fallback.
export async function embedText(text: string) {
  const backend = (process.env.EMBEDDING_BACKEND || '').toLowerCase()
  const useLocal = backend === 'local' || !process.env.OPENAI_API_KEY
  if (useLocal) {
    const local = localDeterministicEmbedding(text)
    assertEmbeddingDimension(local, 'local')
    return local
  }

  const OpenAI = await import('openai')
  const openai = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const resp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text })
  const first = resp.data[0]
  if (!first) throw new Error('embedding service returned no vectors')
  const emb = first.embedding as number[]
  assertEmbeddingDimension(emb, 'openai')
  return emb
}

export async function saveSectionEmbedding(sectionId: string, embedding: number[]) {
  assertEmbeddingDimension(embedding, 'saveSectionEmbedding')
  const vecLiteral = '[' + embedding.join(',') + ']'
  return prisma.$executeRaw`
    UPDATE "Section"
    SET embedding = ${vecLiteral}::vector
    WHERE id = ${sectionId}
  `
}

export async function queryVectors(queryEmbedding: number[], topK = 5) {
  const vecLiteral = '[' + queryEmbedding.join(',') + ']'
  const safeTopK = Math.max(1, Math.min(100, Math.floor(topK)))
  const rows: any[] = await prisma.$queryRawUnsafe(`
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
  `)
  return rows
}
