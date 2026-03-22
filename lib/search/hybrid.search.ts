import { Prisma } from '@prisma/client'
import prisma from '../db/prisma'
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
  const limit = Math.max(1, Math.min(200, input.limit ?? 20))
  const minScore = input.minScore ?? 0.3
  const queryEmbedding = await embedText(input.query)
  const vectorLiteral = `[${queryEmbedding.map((n) => Number(n)).join(',')}]`

  const deviceFilter = input.deviceId
    ? Prisma.sql`AND r."deviceId" = ${input.deviceId}`
    : Prisma.empty
  const langFilter = input.language
    ? Prisma.sql`AND kc.language = ${input.language}`
    : Prisma.empty

  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      kc.id,
      kc."referenceId",
      kc.content,
      kc.language,
      r."deviceId",
      r.title AS "referenceTitle",
      (1 - (kc.embedding <=> ${vectorLiteral}::vector)) AS score
    FROM "KnowledgeChunk" kc
    JOIN "Reference" r ON r.id = kc."referenceId"
    WHERE kc.embedding IS NOT NULL
    ${deviceFilter}
    ${langFilter}
    ORDER BY kc.embedding <=> ${vectorLiteral}::vector
    LIMIT ${Math.max(limit * 2, 20)}
  `

  const ftsRows = await prisma.$queryRaw<any[]>`
    SELECT
      kc.id,
      kc."referenceId",
      kc.content,
      kc.language,
      r."deviceId",
      r.title AS "referenceTitle",
      0.5 AS score
    FROM "KnowledgeChunk" kc
    JOIN "Reference" r ON r.id = kc."referenceId"
    WHERE (
      kc.fts_english @@ websearch_to_tsquery('pg_catalog.english', ${input.query})
      OR kc.fts_arabic @@ websearch_to_tsquery('pg_catalog.arabic', ${input.query})
    )
    ${deviceFilter}
    ${langFilter}
    LIMIT ${Math.max(limit * 2, 20)}
  `

  const merged = new Map<string, any>()
  for (const row of [...rows, ...ftsRows]) {
    const current = merged.get(row.id)
    if (!current || Number(row.score || 0) > Number(current.score || 0)) {
      merged.set(row.id, row)
    }
  }

  return Array.from(merged.values())
    .filter((x) => Number(x.score || 0) >= minScore)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, limit)
}

