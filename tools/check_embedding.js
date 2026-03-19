require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run() {
  try {
    await p.$connect()
    const rows = await p.$queryRawUnsafe('SELECT id, embedding::text AS embedding_text FROM "KnowledgeChunk" LIMIT 5')
    console.log('SAMPLE_EMBEDDINGS', JSON.stringify(rows, null, 2))
    await p.$disconnect()
  } catch (e) {
    console.error('ERROR', e && e.stack || e)
    process.exit(1)
  }
}

run()
