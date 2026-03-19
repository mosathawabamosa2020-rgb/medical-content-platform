// Allow passing the OpenAI API key as the first CLI arg to avoid env precedence issues
const cliKey = process.argv[2]
if (cliKey) {
  process.env.OPENAI_API_KEY = cliKey
} else {
  if (!process.env.OPENAI_API_KEY) {
    require('dotenv').config({ path: '.env.local' })
  }
}
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)) }

async function run(){
  try{
    if(!process.env.OPENAI_API_KEY){
      console.error('OPENAI_API_KEY missing in environment');
      process.exit(2)
    }
    const OpenAI = require('openai')
    const client = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    await p.$connect()
    // fetch rows where embedding is NULL
    const rows = await p.$queryRawUnsafe('SELECT id, content FROM "KnowledgeChunk" WHERE embedding IS NULL')
    console.log('FOUND_KC_TO_EMBED', rows.length)
    for(const r of rows){
      try{
        const input = (r.content || '').slice(0, 2000)
        const resp = await client.embeddings.create({ model: 'text-embedding-3-small', input })
        const emb = resp.data && resp.data[0] && resp.data[0].embedding
        if(!emb || !emb.length){
          console.warn('EMPTY_EMBEDDING', r.id)
          continue
        }
        const vecLiteral = '[' + emb.join(',') + ']'
        await p.$executeRawUnsafe(`UPDATE "KnowledgeChunk" SET embedding = ${vecLiteral}::vector WHERE id = '${r.id}'`)
        console.log('EMBEDDED', r.id)
        // small delay to avoid rate limits
        await sleep(250)
      }catch(e){
        console.error('EMBED_FAIL', r.id, e && e.message || e)
        // if rate limited, wait and retry a bit
        if(e && e.message && e.message.includes('429')) await sleep(2000)
      }
    }
    await p.$disconnect()
    console.log('DONE')
  }catch(e){
    console.error('ERR', e && e.stack || e)
    process.exit(1)
  }
}

run()
