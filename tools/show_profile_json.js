require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function show(deviceModel) {
  await p.$connect()
  const secs = await p.$queryRawUnsafe(
    `SELECT s.title,s.content FROM "Section" s JOIN "Device" d ON s."deviceId"=d.id WHERE d.model=$1 ORDER BY s."order"`,
    deviceModel
  )
  const profile = {}
  secs.forEach(r => { profile[r.title] = r.content })
  console.log(JSON.stringify(profile, null, 2))
  await p.$disconnect()
}

show(process.argv[2] || 'K180324').catch(e => { console.error(e); process.exit(1) })
