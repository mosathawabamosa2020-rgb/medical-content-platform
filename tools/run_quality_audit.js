require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

function similarity(a, b) {
  const aw = new Set(a.toLowerCase().split(/\W+/).filter(Boolean))
  const bw = new Set(b.toLowerCase().split(/\W+/).filter(Boolean))
  const inter = [...aw].filter(w => bw.has(w)).length
  const uni = new Set([...aw, ...bw]).size
  return uni === 0 ? 0 : inter / uni
}

function summarize(text) {
  const sentences = text.match(/[^\.\!\?]+[\.\!\?]+/g) || [text]
  let s = sentences.slice(0, 2).join(' ').trim()
  const synonyms = {
    device: 'instrument',
    system: 'assembly',
    spinal: 'back-related',
    fixation: 'stabilization',
    patient: 'individual',
    screw: 'fastener',
    component: 'element'
  }
  Object.keys(synonyms).forEach(k => {
    const re = new RegExp(`\\b${k}\\b`, 'gi')
    s = s.replace(re, synonyms[k])
  })
  return s
}

async function audit() {
  await p.$connect()
  const devices = await p.device.findMany()
  const report = []
  for (const d of devices) {
    const secs = await p.section.findMany({ where: { deviceId: d.id } })
    const total = secs.length
    const falsePos = secs
      .map(s => s.title)
      .filter(t => /page|confidential|\b\d+\b/i.test(t) || t.trim().length < 5)
    const coherenceIssues = secs
      .filter(s => (s.content || '').trim().length < 50)
      .map(s => s.title)
    let sumSim = 0
    secs.forEach(s => {
      const snip = summarize(s.content || '')
      sumSim += similarity(snip, s.content || '')
    })
    const avgSim = total ? sumSim / total : 0
    report.push({
      device: d.model,
      totalSections: total,
      falsePositives: falsePos,
      coherenceIssues,
      avgTransformationSimilarity: avgSim
    })
  }
  await p.$disconnect()
  console.log(JSON.stringify(report, null, 2))
}

audit().catch(e => { console.error(e); process.exit(1) })
