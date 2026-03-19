const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'artifacts', 'live_retrieval_visibility_proof_2026-03-11.json')
const OUTPUT_PATH = path.join(ROOT, 'artifacts', 'live_vector_retrieval_proof_2026-03-11.json')
const DEFAULT_BASE_URL = 'http://localhost:3000'
const DEFAULT_EMBEDDING_DIMENSION = 1536

function normalizeL2(vec) {
  let sum = 0
  for (const v of vec) sum += v * v
  const norm = Math.sqrt(sum) || 1
  return vec.map((v) => v / norm)
}

function getEmbeddingDimension() {
  const raw = Number(process.env.EMBEDDING_DIMENSION || DEFAULT_EMBEDDING_DIMENSION)
  if (Number.isNaN(raw) || raw < 64) return DEFAULT_EMBEDDING_DIMENSION
  return Math.floor(raw)
}

function localDeterministicEmbedding(text, dim = getEmbeddingDimension()) {
  const out = new Array(dim).fill(0)
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

async function embedText(text) {
  const backend = (process.env.EMBEDDING_BACKEND || '').toLowerCase()
  const useLocal = backend === 'local' || !process.env.OPENAI_API_KEY
  if (useLocal) return localDeterministicEmbedding(text)

  const OpenAI = await import('openai')
  const openai = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const resp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text })
  const first = resp.data[0]
  if (!first) throw new Error('embedding service returned no vectors')
  return first.embedding
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

async function upsertSectionEmbeddings(prisma, referenceIds) {
  const updates = []
  for (const referenceId of referenceIds) {
    const sections = await prisma.section.findMany({
      where: { referenceId },
      select: { id: true, content: true },
    })
    for (const section of sections) {
      const emb = await embedText(section.content || '')
      const vecLiteral = `[${emb.join(',')}]`
      await prisma.$executeRawUnsafe(
        `UPDATE "Section" SET embedding = '${vecLiteral}'::vector WHERE id = '${section.id}'`
      )
      updates.push({ sectionId: section.id, referenceId })
    }
  }
  return updates
}

async function main() {
  const startedAt = new Date().toISOString()
  const input = readJson(INPUT_PATH)
  const baseUrl = process.env.RETRIEVAL_PROOF_BASE_URL || input.baseUrl || DEFAULT_BASE_URL
  const referenceIds = input.referenceIds || []

  const prisma = new PrismaClient()
  const embedUpdates = []
  const retrieval = {
    baseUrl,
    request: null,
    responseStatus: null,
    responseBody: null,
    error: null,
  }
  const embeddingBackend =
    (process.env.EMBEDDING_BACKEND || '').toLowerCase() || (process.env.OPENAI_API_KEY ? 'openai' : 'local')

  try {
    embedUpdates.push(...(await upsertSectionEmbeddings(prisma, referenceIds)))

    const queryText = 'rfc 2606'
    const requestBody = { query: queryText, topK: 5, page: 1 }
    retrieval.request = { url: `${baseUrl}/api/references/query`, body: requestBody }

    try {
      const res = await fetch(`${baseUrl}/api/references/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      retrieval.responseStatus = res.status
      const payload = await res.json()
      retrieval.responseBody = payload
    } catch (err) {
      retrieval.error = err?.message || String(err)
    }
  } finally {
    await prisma.$disconnect()
  }

  const output = {
    startedAt,
    baseUrl,
    inputProof: path.basename(INPUT_PATH),
    referenceIds,
    embedUpdates,
    retrieval,
    embeddingBackend,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`vector retrieval proof written to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error('vector retrieval proof failed', err)
  process.exit(1)
})
