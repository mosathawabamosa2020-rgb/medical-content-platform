require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const LIST_OPTIONS = [100, 200, 500]
const PROBE_OPTIONS = [5, 10, 20, 40]
const CONCURRENCY = Number(process.env.BENCH_CONCURRENCY || 20)
const TOTAL_REQUESTS = Number(process.env.BENCH_REQUESTS || 20)
const TOP_K = Number(process.env.BENCH_TOPK || 25)
const CANDIDATE_LIMIT = Number(process.env.BENCH_CANDIDATES || 200)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 30,
  idleTimeoutMillis: 30_000,
})

function percentile(sorted, p) {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

async function exec(sql) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const client = await pool.connect()
    try {
      return await client.query(sql)
    } catch (err) {
      if (attempt === 2) throw err
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    } finally {
      client.release()
    }
  }
}

async function ensureAnalyze() {
  await exec('ANALYZE "Section";')
  await exec('ANALYZE "Reference";')
}

async function recreateIvfIndex(lists) {
  await exec('DROP INDEX IF EXISTS section_embedding_ivfflat;')
  await exec("SET maintenance_work_mem = '256MB';")
  await exec(`
    CREATE INDEX section_embedding_ivfflat
    ON "Section"
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = ${lists});
  `)
  await ensureAnalyze()
}

async function queryAnn(embeddingLiteral, probe) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const client = await pool.connect()
    try {
      await client.query(`SET ivfflat.probes = ${probe};`)
      const res = await client.query(`
      SELECT cand.id
      FROM (
        SELECT s.id, s."referenceId", (s.embedding <=> '${embeddingLiteral}'::vector) AS distance
        FROM "Section" s
        JOIN "Reference" r ON r.id = s."referenceId"
        WHERE s.embedding IS NOT NULL
          AND r.status = 'verified'
        ORDER BY s.embedding <=> '${embeddingLiteral}'::vector
        LIMIT ${CANDIDATE_LIMIT}
      ) cand
      ORDER BY cand.distance ASC
      LIMIT ${TOP_K};
    `)
      return res.rows
    } catch (err) {
      if (attempt === 2) throw err
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    } finally {
      client.release()
    }
  }
}

async function queryExact(embeddingLiteral) {
  const res = await exec(`
    SELECT s.id
    FROM "Section" s
    JOIN "Reference" r ON r.id = s."referenceId"
    WHERE s.embedding IS NOT NULL
      AND r.status = 'verified'
    ORDER BY s.embedding <=> '${embeddingLiteral}'::vector
    LIMIT ${TOP_K};
  `)
  return res.rows
}

async function benchProbe(embeddings, probe) {
  const latencies = []
  let cursor = 0

  async function worker() {
    while (true) {
      const i = cursor
      cursor += 1
      if (i >= TOTAL_REQUESTS) return
      const emb = embeddings[i % embeddings.length].emb
      const start = process.hrtime.bigint()
      await queryAnn(emb, probe)
      const end = process.hrtime.bigint()
      latencies.push(Number(end - start) / 1_000_000)
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker())
  const wallStart = Date.now()
  await Promise.all(workers)
  const wallMs = Date.now() - wallStart
  latencies.sort((a, b) => a - b)

  let recallSum = 0
  const recallSamples = Math.min(2, embeddings.length)
  for (let i = 0; i < recallSamples; i += 1) {
    const emb = embeddings[i].emb
    const [ann, exact] = await Promise.all([queryAnn(emb, probe), queryExact(emb)])
    const annSet = new Set(ann.map((x) => x.id))
    const exactIds = exact.map((x) => x.id)
    const overlap = exactIds.filter((id) => annSet.has(id)).length
    recallSum += overlap / TOP_K
  }

  return {
    requests: TOTAL_REQUESTS,
    concurrency: CONCURRENCY,
    wallMs,
    p50Ms: Number(percentile(latencies, 50).toFixed(2)),
    p95Ms: Number(percentile(latencies, 95).toFixed(2)),
    p99Ms: Number(percentile(latencies, 99).toFixed(2)),
    avgMs: Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)),
    approxRecallAtK: Number((recallSum / recallSamples).toFixed(4)),
  }
}

async function main() {
  const settings = (await exec(`
    SELECT name, setting, unit
    FROM pg_settings
    WHERE name IN ('max_connections','shared_buffers','work_mem','effective_cache_size','maintenance_work_mem')
    ORDER BY name;
  `)).rows

  const dims = (await exec(`
    SELECT vector_dims(embedding) AS dim
    FROM "Section"
    WHERE embedding IS NOT NULL
    LIMIT 1;
  `)).rows

  const embeddings = (await exec(`
    SELECT embedding::text AS emb
    FROM "Section"
    WHERE embedding IS NOT NULL
    LIMIT 50;
  `)).rows

  const results = []
  for (const lists of LIST_OPTIONS) {
    await recreateIvfIndex(lists)
    const perProbe = []
    for (const probe of PROBE_OPTIONS) {
      const metrics = await benchProbe(embeddings, probe)
      perProbe.push({ probe, ...metrics })
    }
    results.push({ lists, runs: perProbe })
  }

  const indexInfo = (await exec(`
    SELECT
      c.relname AS index_name,
      pg_get_indexdef(i.indexrelid) AS indexdef,
      c.reloptions
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_class t ON t.oid = i.indrelid
    WHERE t.relname = 'Section' AND c.relname = 'section_embedding_ivfflat';
  `)).rows

  const out = {
    generatedAt: new Date().toISOString(),
    dimensions: dims[0]?.dim || null,
    dbSettings: settings,
    indexInfo,
    options: {
      lists: LIST_OPTIONS,
      probes: PROBE_OPTIONS,
      totalRequests: TOTAL_REQUESTS,
      concurrency: CONCURRENCY,
      topK: TOP_K,
    },
    results,
  }

  console.log(JSON.stringify(out, null, 2))
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
