const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const { PrismaClient } = require('@prisma/client')
function loadLogger() {
  try {
    const mod = require(path.join(process.cwd(), 'lib', 'logger'))
    return mod.default || mod
  } catch {
    try {
      const mod = require(path.join(process.cwd(), 'dist', 'lib', 'logger'))
      return mod.default || mod
    } catch {
      return console
    }
  }
}

const prisma = new PrismaClient()
const logger = loadLogger()

function loadEmbeddingsLib() {
  try {
    return require(path.join(process.cwd(), 'lib', 'embeddings'))
  } catch {
    return require(path.join(process.cwd(), 'dist', 'lib', 'embeddings'))
  }
}
const embedLib = loadEmbeddingsLib()

async function readEnvKey() {
  const envPath = path.join(process.cwd(), '.env.local')
  const envPathAlt = path.join(process.cwd(), '.env')
  let content = ''
  if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8')
  else if (fs.existsSync(envPathAlt)) content = fs.readFileSync(envPathAlt, 'utf8')
  const m = content.match(/OPENAI_API_KEY\s*=\s*(.*)/)
  if (m) return m[1].trim().replace(/(^\"|\"$)/g, '')
  return process.env.OPENAI_API_KEY || null
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i] }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-10)
}

async function embedTextOPENAI(apiKey, text) {
  const resp = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
  })
  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error('Embedding failed: ' + resp.status + ' ' + txt)
  }
  const j = await resp.json()
  return j.data[0].embedding
}

async function main() {
  const apiKey = await readEnvKey()
  if (!apiKey) {
    logger.error('OPENAI_API_KEY not found in .env.local or process.env')
    process.exit(1)
  }

  // Using pgvector in the database now; no local JSON vector store required

  const TOPICS = ['common errors', 'calibration', 'maintenance', 'safety warnings']

  const devices = await prisma.device.findMany()
  logger.info({ devices: devices.length }, 'Found devices')

  for (const device of devices) {
    logger.info({ device: device.id, name: device.name, model: device.model }, 'Processing device')
    for (const topic of TOPICS) {
      logger.info({ topic }, 'Embedding topic')
      const qemb = await embedLib.embedText(topic)
      const matches = await embedLib.queryVectors(qemb, 20)
      // filter for this device
      const deviceMatches = matches.filter(m => m.deviceId === device.id)
      const top = deviceMatches.slice(0,5)

      // delete previous suggestions for this device+topic
      await prisma.plannerSuggestion.deleteMany({ where: { deviceId: device.id, topic } })

      for (const s of top) {
        const referenceId = s.referenceId || s.id
        await prisma.plannerSuggestion.create({ data: {
          deviceId: device.id,
          topic,
          referenceId,
          page: s.page || null,
          snippet: (s.pageContent || '').slice(0,1000),
          score: s.similarity || s.score || 0,
        } })
      }
      logger.info({ topic, stored: top.length }, `Stored suggestions`) 
    }
  }

  logger.info('Done')
  process.exit(0)
}

main().catch(e => { logger.error(e); process.exit(1) })
