import prisma from '../prisma'
import { embedText } from '../embeddings'

export type HybridSearchInput = {
  query: string
  limit?: number
  minScore?: number
  deviceId?: string
  chunkType?: string
  audienceLevel?: string
  language?: string
}

export async function hybridSearch(input: HybridSearchInput) {
  const limit = input.limit ?? 20
  const minScore = input.minScore ?? 0.3
  const queryEmbedding = await embedText(input.query)
  const vectorLiteral = `[${queryEmbedding.join(',')}]`

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      kc.id,
      kc."referenceId",
      kc.content,
      kc.language,
      r."deviceId",
      r.title as "referenceTitle",
      (1 - (kc.embedding <=> '${vectorLiteral}'::vector)) AS score
    FROM "KnowledgeChunk" kc
    JOIN "Reference" r ON r.id = kc."referenceId"
    WHERE kc.embedding IS NOT NULL
      ${input.deviceId ? `AND r."deviceId" = '${input.deviceId}'` : ''}
      ${input.language ? `AND kc.language = '${input.language}'` : ''}
    ORDER BY kc.embedding <=> '${vectorLiteral}'::vector
    LIMIT ${Math.max(limit * 2, 20)}
  `)

  const ftsRows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      kc.id,
      kc."referenceId",
      kc.content,
      kc.language,
      r."deviceId",
      r.title as "referenceTitle",
      0.5 as score
    FROM "KnowledgeChunk" kc
    JOIN "Reference" r ON r.id = kc."referenceId"
    WHERE kc.content ILIKE '%' || $1 || '%'
      ${input.deviceId ? `AND r."deviceId" = '${input.deviceId}'` : ''}
      ${input.language ? `AND kc.language = '${input.language}'` : ''}
    LIMIT ${Math.max(limit * 2, 20)}
  `, input.query)

  const merged = new Map<string, any>()
  for (const row of [...rows, ...ftsRows]) {
    const current = merged.get(row.id)
    if (!current || row.score > current.score) merged.set(row.id, row)
  }
  return Array.from(merged.values())
    .filter((x) => Number(x.score || 0) >= minScore)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, limit)
}

