require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20 })

function normalizeL2(vec) {
  let s = 0
  for (const v of vec) s += v * v
  const n = Math.sqrt(s) || 1
  return vec.map((v) => v / n)
}

function localEmbedding(text, dim = 1536) {
  const out = new Array(dim).fill(0)
  let seed = 2166136261
  const input = (text || '').toLowerCase()
  for (let i = 0; i < input.length; i += 1) {
    seed ^= input.charCodeAt(i)
    seed = Math.imul(seed, 16777619)
    out[Math.abs(seed) % dim] += ((seed >>> 0) % 2000) / 1000 - 1
  }
  return normalizeL2(out)
}

const STOPWORDS = new Set(['the', 'of', 'for', 'to', 'in', 'on', 'with', 'and', 'or', 'من', 'في', 'على', 'الى', 'إلى', 'عن', 'و', 'او', 'أو', 'التي', 'الذي'])

function normalizeQuery(raw) {
  const cleaned = (raw || '').toLowerCase().replace(/[\u0000-\u001F\u007F]/g, ' ')
  const arabic = cleaned
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u0625\u0623\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
  return arabic
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t))
    .slice(0, 64)
    .join(' ')
    .slice(0, 1000)
}

function score(similarity, content, query) {
  const q = query.split(/\s+/).filter(Boolean)
  const k = q.length ? q.filter((t) => (content || '').toLowerCase().includes(t)).length / q.length : 0
  return similarity * 0.75 + k * 0.25
}

async function runOne(query) {
  const t0 = Date.now()
  const n0 = Date.now()
  const normalized = normalizeQuery(query)
  const normalizationMs = Date.now() - n0

  const e0 = Date.now()
  const emb = localEmbedding(normalized)
  const embeddingMs = Date.now() - e0
  const vec = `[${emb.join(',')}]`

  const v0 = Date.now()
  const phase1 = await pool.query(`
    SELECT cand.id, cand."referenceId", 1 - cand.distance AS similarity
    FROM (
      SELECT s.id, s."referenceId", (s.embedding <=> '${vec}'::vector) AS distance
      FROM "Section" s
      JOIN "Reference" r ON r.id = s."referenceId"
      WHERE s.embedding IS NOT NULL
        AND r.status = 'verified'
      ORDER BY s.embedding <=> '${vec}'::vector
      LIMIT 200
    ) cand
    ORDER BY cand.distance ASC
    LIMIT 75
  `)
  const dbVectorMs = Date.now() - v0

  const h0 = Date.now()
  const ids = phase1.rows.map((r) => `'${r.id}'`).join(',')
  const phase2 = ids
    ? await pool.query(`
      SELECT s.id, s.content, s.title, r.id AS "referenceId", r."sourceUrl", r."deviceId", r."uploadedAt"
      FROM "Section" s
      JOIN "Reference" r ON r.id = s."referenceId"
      WHERE s.id IN (${ids})
    `)
    : { rows: [] }
  const hydrationMs = Date.now() - h0

  const r0 = Date.now()
  const sim = new Map(phase1.rows.map((r) => [r.id, Number(r.similarity || 0)]))
  const ranked = phase2.rows
    .map((x) => ({ ...x, score: score(sim.get(x.id) || 0, x.content, normalized) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
  const rankingMs = Date.now() - r0

  const s0 = Date.now()
  const results = ranked.map((x) => ({ id: x.id, score: Number(x.score.toFixed(6)), snippet: String(x.content || '').slice(0, 240) }))
  const serializationMs = Date.now() - s0

  return {
    query,
    normalizationMs,
    embeddingMs,
    dbVectorMs,
    hydrationMs,
    rankingMs,
    serializationMs,
    totalMs: Date.now() - t0,
    resultCount: results.length,
  }
}

async function main() {
  const qs = ['medical device safety', 'imaging system quality control', 'laboratory instrument calibration', 'analytical workflow validation', 'clinical device performance']
  const samples = []
  for (const q of qs) samples.push(await runOne(q))
  const avg = (k) => Number((samples.reduce((a, x) => a + x[k], 0) / samples.length).toFixed(2))
  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      normalizationMs: avg('normalizationMs'),
      embeddingMs: avg('embeddingMs'),
      dbVectorMs: avg('dbVectorMs'),
      hydrationMs: avg('hydrationMs'),
      rankingMs: avg('rankingMs'),
      serializationMs: avg('serializationMs'),
      totalMs: avg('totalMs'),
    },
    samples,
  }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await pool.end()
})
