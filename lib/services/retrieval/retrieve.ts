import { RETRIEVAL_POLICY } from './policy'
import type { RetrievalCandidate } from './types'

function normalizeProbe(probe?: number) {
  const raw = Number(probe || process.env.RETRIEVAL_IVFFLAT_PROBES || RETRIEVAL_POLICY.DEFAULT_IVFFLAT_PROBES)
  if (Number.isNaN(raw)) return RETRIEVAL_POLICY.DEFAULT_IVFFLAT_PROBES
  return Math.max(1, Math.min(RETRIEVAL_POLICY.MAX_IVFFLAT_PROBES, Math.floor(raw)))
}

export async function retrieveVectorCandidates(
  prisma: any,
  queryEmbedding: number[],
  topK: number,
  deviceId?: string,
  probe?: number
): Promise<{ rows: RetrievalCandidate[]; probe: number; dbVectorMs: number; hydrationMs: number }> {
  const limit = Math.max(1, topK * RETRIEVAL_POLICY.PREFETCH_MULTIPLIER)
  const sectionProbeLimit = Math.max(200, limit * 8)
  const vecLiteral = `[${queryEmbedding.join(',')}]`
  const ivfProbe = normalizeProbe(probe)
  const vectorStart = Date.now()

  const lightweight: Array<{ id: string; referenceId: string; similarity: number }> = await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL ivfflat.probes = ${ivfProbe}`)

    if (deviceId) {
      return tx.$queryRaw`
      SELECT
        cand.id,
        cand."referenceId" as "referenceId",
        1 - cand.distance as similarity
      FROM (
        SELECT
          s.id,
          s."referenceId",
          (s.embedding <=> ${vecLiteral}::vector) as distance
        FROM "Section" s
        JOIN "Reference" r ON r.id = s."referenceId"
        WHERE s.embedding IS NOT NULL
          AND r.status = 'verified'
          AND r."deviceId" = ${deviceId}
        ORDER BY s.embedding <=> ${vecLiteral}::vector
        LIMIT ${sectionProbeLimit}
      ) cand
      JOIN "Reference" r ON r.id = cand."referenceId"
      WHERE r.status = 'verified'
      ORDER BY cand.distance ASC
      LIMIT ${limit}
    `
    }

    return tx.$queryRaw`
      SELECT
        cand.id,
        cand."referenceId" as "referenceId",
        1 - cand.distance as similarity
      FROM (
        SELECT
          s.id,
          s."referenceId",
          (s.embedding <=> ${vecLiteral}::vector) as distance
        FROM "Section" s
        JOIN "Reference" r ON r.id = s."referenceId"
        WHERE s.embedding IS NOT NULL
          AND r.status = 'verified'
        ORDER BY s.embedding <=> ${vecLiteral}::vector
        LIMIT ${sectionProbeLimit}
      ) cand
      JOIN "Reference" r ON r.id = cand."referenceId"
      WHERE r.status = 'verified'
      ORDER BY cand.distance ASC
      LIMIT ${limit}
    `
  })
  const dbVectorMs = Date.now() - vectorStart

  const hydrationStart = Date.now()
  const ids = lightweight.map((r) => `'${r.id}'`).join(',')
  const details: RetrievalCandidate[] = ids.length
    ? await prisma.$queryRawUnsafe(`
      SELECT
        s.id,
        s."referenceId" as "referenceId",
        s.content as "pageContent",
        r."deviceId" as "deviceId",
        r."sourceReliabilityScore" as "sourceReliabilityScore",
        r."uploadedAt" as "uploadedAt",
        r."sourceUrl" as "sourceUrl",
        s.title as title
      FROM "Section" s
      JOIN "Reference" r ON r.id = s."referenceId"
      WHERE s.id IN (${ids})
    `)
    : []
  const hydrationMs = Date.now() - hydrationStart

  const byId = new Map<string, RetrievalCandidate>()
  for (const d of details) byId.set(d.id, d)

  const rows: RetrievalCandidate[] = []
  for (const c of lightweight) {
    const hydrated = byId.get(c.id)
    if (!hydrated) continue
    rows.push({
      ...hydrated,
      similarity: c.similarity,
    })
  }

  return { rows, probe: ivfProbe, dbVectorMs, hydrationMs }
}
