// Regenerate embeddings using Google Generative API (Gemini) via REST
// Usage: node tools/regenerate_embeddings_google.js <API_KEY>
const fs = require('fs')
const path = require('path')
const fetch = global.fetch || require('node-fetch')
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const apiKey = process.argv[2] || process.env.GOOGLE_API_KEY
    if(!apiKey){ console.error('GOOGLE API key required as CLI arg or GOOGLE_API_KEY env'); process.exit(2) }
    const chunksPath = path.join(process.cwd(),'data','chunks_to_embed.json')
    if(!fs.existsSync(chunksPath)){ console.error('chunks_to_embed.json not found'); process.exit(3) }
    const chunks = JSON.parse(fs.readFileSync(chunksPath,'utf8'))
    console.log('CHUNKS_TO_EMBED', chunks.length)
    await p.$connect()

    // Try known Google Generative API embedding model names; prefer textembedding-gecko-001
    const model = 'textembedding-gecko-001'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:embed?key=${apiKey}`

    for(const c of chunks){
      try{
        const input = (c.content || '').slice(0, 2000)
        const body = { input }
        const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) })
        const j = await resp.json()
        // detect embedding in response
        let emb = null
        if(j && Array.isArray(j.embeddings) && j.embeddings[0] && Array.isArray(j.embeddings[0].embedding)) emb = j.embeddings[0].embedding
        if(!emb && j && j.results && j.results[0] && j.results[0].embedding) emb = j.results[0].embedding
        if(!emb && j && j.data && j.data[0] && j.data[0].embedding) emb = j.data[0].embedding
        if(!emb){ console.warn('NO_EMBED_IN_RESP', c.id, JSON.stringify(j).slice(0,200)); continue }
        const vecLiteral = '[' + emb.join(',') + ']'
        await p.$executeRawUnsafe(`UPDATE "KnowledgeChunk" SET embedding = ${vecLiteral}::vector WHERE id = '${c.id}'`)
        console.log('EMBEDDED', c.id)
      }catch(e){ console.error('ERR_EMBED', c.id, e && e.message || e) }
      // small delay
      await new Promise(r=>setTimeout(r,250))
    }

    await p.$disconnect()
    console.log('DONE')
  }catch(e){ console.error('ERR', e && e.stack || e); process.exit(1) }
}

run()
