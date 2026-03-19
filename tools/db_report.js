require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run() {
  try {
    await p.$connect()
    const devCount = await p.device.count()
    const refCount = await p.reference.count()
    console.log('DEVICE_COUNT', devCount)
    console.log('REFERENCE_COUNT', refCount)
    const dev = (await p.device.findMany({ take: 1 }))[0]
    console.log('SAMPLE_DEVICE', JSON.stringify(dev, null, 2))
    const ref = (await p.reference.findMany({ take: 1 }))[0]
    console.log('SAMPLE_REFERENCE', JSON.stringify(ref, null, 2))
    const kc = (await p.knowledgeChunk.findMany({ take: 1 }))[0]
    console.log('KNOWLEDGE_CHUNK_COUNT', await p.knowledgeChunk.count())
    console.log('SAMPLE_KNOWLEDGE_CHUNK', JSON.stringify(kc, null, 2))
    const sc = (await p.section.findMany({ take: 1 }))[0]
    console.log('SECTION_COUNT', await p.section.count())
    console.log('SAMPLE_SECTION', JSON.stringify(sc, null, 2))
    await p.$disconnect()
  } catch (e) {
    console.error('DB_QUERY_ERROR', e && e.stack || e)
    process.exit(1)
  }
}

run()
