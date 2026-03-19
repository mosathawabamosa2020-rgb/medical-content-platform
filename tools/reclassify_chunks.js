require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
// we no longer use OpenAI; classification will be rule-based

const p = new PrismaClient()

// categories to choose from
const categories = [
  'Scientific Definition',
  'Principle of Operation',
  'Core Components',
  'Calibration',
  'Common Failures',
  'Preventive Maintenance',
  'Risks and Warnings',
  'Other'
]

async function run() {
  try {
    await p.$connect()
    const chunks = await p.$queryRawUnsafe(`SELECT kc.id,kc.content FROM "KnowledgeChunk" kc JOIN "Reference" r ON kc."referenceId"=r.id JOIN "Device" d ON r."deviceId"=d.id WHERE d.model='K180324'`)
    console.log('FOUND_CHUNKS', chunks.length)
    for (const c of chunks) {
      try {
        const text = (c.content || '').toLowerCase()
        let category = 'Other'
        if (/failure|failures?|error|broken|malfunction/.test(text)) category = 'Common Failures'
        else if (/risk|warn|warning|caution|hazard/.test(text)) category = 'Risks and Warnings'
        else if (/calibrat|adjust|tune|setting/.test(text)) category = 'Calibration'
        else if (/component|part|assembly|rod|screw/.test(text)) category = 'Core Components'
        else if (/principle|operate|operation|function|how it works/.test(text)) category = 'Principle of Operation'
        else if (/define|definition|what is/.test(text)) category = 'Scientific Definition'
        else if (/mainten|service|inspection|clean/.test(text)) category = 'Preventive Maintenance'
        if (!categories.includes(category)) category = 'Other'
        await p.knowledgeChunk.update({ where: { id: c.id }, data: { category } })
        console.log('RECLASSIFIED', c.id, category)
      } catch (e) {
        console.error('CLASSIFY_ERR', c.id, e.message || e)
      }
    }
    await p.$disconnect()
    console.log('DONE')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
