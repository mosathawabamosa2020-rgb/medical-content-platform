require('dotenv').config({ path: '.env.local' })
const { execSync } = require('child_process')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 30 })
const TOTAL_REQUESTS = 40
const CONCURRENCY = 20

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

function percentile(sorted, p) {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return Number(sorted[idx].toFixed(2))
}

function findPostgresContainer() {
  try {
    const rows = execSync('docker ps --format "{{.Names}} {{.Image}}"', { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, image] = line.split(/\s+/, 2)
        return { name, image: image || '' }
      })
    const preferred = rows.find((r) => /pgvector|postgres/i.test(r.image) && /-db-|postgres|pg/i.test(r.name))
    return preferred?.name || null
  } catch {
    return null
  }
}

function sampleCpu(containerName) {
  try {
    const out = execSync(`docker stats --no-stream --format "{{.CPUPerc}}" ${containerName}`, { encoding: 'utf8' }).trim()
    const m = out.match(/([\d.]+)%/)
    return m ? Number(m[1]) : null
  } catch {
    return null
  }
}

async function retrievalRun(query) {
  const t0 = Date.now()
  const normalized = query.toLowerCase().replace(/\s+/g, ' ').trim()
  const emb = localEmbedding(normalized)
  const vec = `[${emb.join(',')}]`

  const v0 = Date.now()
  await pool.query('SET ivfflat.probes = 20;')
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
      SELECT s.id, s.content, s.title, r.id AS "referenceId"
      FROM "Section" s
      JOIN "Reference" r ON r.id = s."referenceId"
      WHERE s.id IN (${ids})
    `)
    : { rows: [] }
  const hydrationMs = Date.now() - h0

  const r0 = Date.now()
  const sim = new Map(phase1.rows.map((r) => [r.id, Number(r.similarity || 0)]))
  phase2.rows
    .map((x) => ({ ...x, score: (sim.get(x.id) || 0) * 0.75 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
  const rankingMs = Date.now() - r0
  return { totalMs: Date.now() - t0, dbVectorMs, hydrationMs, rankingMs }
}

async function main() {
  const queries = [
    'laboratory instrument workflow',
    'imaging device reliability',
    'analytical instrument performance',
    'medical device safety',
    'verification status evidence',
  ]

  const container = findPostgresContainer()
  const cpuSamples = []
  const timer = container
    ? setInterval(() => {
      const x = sampleCpu(container)
      if (typeof x === 'number') cpuSamples.push(x)
    }, 1000)
    : null

  const latencies = []
  const components = []
  let cursor = 0
  async function worker() {
    while (true) {
      const i = cursor
      cursor += 1
      if (i >= TOTAL_REQUESTS) return
      const out = await retrievalRun(queries[i % queries.length])
      latencies.push(out.totalMs)
      components.push(out)
    }
  }

  const start = Date.now()
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  const wallMs = Date.now() - start
  if (timer) clearInterval(timer)

  latencies.sort((a, b) => a - b)
  const avg = (k) => Number((components.reduce((a, x) => a + x[k], 0) / components.length).toFixed(2))

  const sections = Number((await pool.query('SELECT COUNT(*)::bigint AS c FROM "Section"')).rows[0].c)
  const explain = (await pool.query(`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
    SELECT cand.id, cand."referenceId", 1 - cand.distance AS similarity
    FROM (
      SELECT s.id, s."referenceId", (s.embedding <=> '[${localEmbedding('medical device safety').join(',')}]'::vector) AS distance
      FROM "Section" s
      JOIN "Reference" r ON r.id = s."referenceId"
      WHERE s.embedding IS NOT NULL
        AND r.status = 'verified'
      ORDER BY s.embedding <=> '[${localEmbedding('medical device safety').join(',')}]'::vector
      LIMIT 200
    ) cand
    ORDER BY cand.distance ASC
    LIMIT 75
  `)).rows.map((r) => r['QUERY PLAN'])

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    dataset: { sections },
    concurrency: CONCURRENCY,
    latency: {
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      avg: Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)),
      wallMs,
    },
    decompositionAvgMs: {
      dbVectorMs: avg('dbVectorMs'),
      hydrationMs: avg('hydrationMs'),
      rankingMs: avg('rankingMs'),
      totalMs: avg('totalMs'),
    },
    cpuUsage: {
      container,
      sampleCount: cpuSamples.length,
      avgPercent: cpuSamples.length ? Number((cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length).toFixed(2)) : null,
      maxPercent: cpuSamples.length ? Math.max(...cpuSamples) : null,
    },
    explainPlan: explain,
  }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await pool.end()
})
