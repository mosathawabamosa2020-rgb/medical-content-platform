require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    await p.$connect()
    // select chunks where embedding is NULL
    const rows = await p.$queryRawUnsafe('SELECT id, content, "referenceId", "pageNumber", category FROM "KnowledgeChunk" WHERE embedding IS NULL')
    const out = rows.map(r=>({ id: r.id, referenceId: r.referenceId, pageNumber: r.pageNumber, category: r.category, content: r.content }))
    const outPath = path.join(process.cwd(),'data','chunks_to_embed.json')
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
    console.log('WROTE', outPath, 'COUNT', out.length)
    await p.$disconnect()
  }catch(e){
    console.error('ERR', e && e.stack || e)
    process.exit(1)
  }
}

run()
