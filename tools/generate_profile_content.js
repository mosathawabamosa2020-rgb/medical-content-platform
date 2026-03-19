require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function fetchProfile(deviceModel) {
  // prefer structured sections if available
  // only pull sections that haven't been rejected
  const secs = await p.$queryRawUnsafe(`SELECT s.title,s.content FROM "Section" s JOIN "Device" d ON s."deviceId"=d.id WHERE d.model=$1 AND s.status != 'rejected' ORDER BY s."order"`, deviceModel)
  if (secs && secs.length) {
    const profile = {}
    secs.forEach(r => { profile[r.title] = r.content })
    return profile
  }
  // fallback to older chunk grouping
  const chunks = await p.$queryRawUnsafe(`SELECT kc.id,kc.content,kc.category FROM "KnowledgeChunk" kc JOIN "Reference" r ON kc."referenceId"=r.id JOIN "Device" d ON r."deviceId"=d.id WHERE d.model=$1`, deviceModel)
  const profile = {}
  for (const c of chunks) {
    if (!profile[c.category]) profile[c.category] = []
    profile[c.category].push(c.content)
  }
  return profile
}


// simple summarizer picks first two sentences and replaces common words with synonyms
function summarize(text) {
  const sentences = text.match(/[^\.\!\?]+[\.\!\?]+/g) || [text]
  let s = sentences.slice(0, 2).join(' ').trim()
  // naive synonym substitution
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

function similarity(a, b) {
  const aw = new Set(a.toLowerCase().split(/\W+/).filter(Boolean))
  const bw = new Set(b.toLowerCase().split(/\W+/).filter(Boolean))
  const inter = [...aw].filter(w => bw.has(w)).length
  const uni = new Set([...aw, ...bw]).size
  return uni === 0 ? 0 : inter / uni
}

function renderContent(profile) {
  const lines = []
  lines.push('--- PUBLIC VERSION ---')
  lines.push('This medical device is described by the following key aspects:')
  for (const cat in profile) {
    const snippet = summarize(profile[cat])
    const sim = similarity(snippet, profile[cat])
    lines.push(`* ${cat}: ${snippet}`)
    lines.push(`  (similarity to source: ${Math.round(sim*100)}%)`)
  }
  lines.push('')
  lines.push('--- STUDENT VERSION ---')
  lines.push('Study the device through these concepts:')
  for (const cat in profile) {
    lines.push(`- ${cat}:`)
    lines.push('    ' + profile[cat].replace(/\n/g,' '))
  }
  lines.push('')
  lines.push('--- TECHNICAL VERSION ---')
  for (const cat in profile) {
    lines.push(`${cat}:`)
    lines.push('    ' + profile[cat].replace(/\n/g,' '))
  }
  lines.push('')
  lines.push('--- CLINICAL VERSION ---')
  if (profile['Risks and Warnings']) {
    lines.push('Risks and Warnings:')
    lines.push('    '+profile['Risks and Warnings'].replace(/\n/g,' '))
  }
  if (profile['Common Failures']) {
    lines.push('Common Failures:')
    lines.push('    '+profile['Common Failures'].replace(/\n/g,' '))
  }
  return lines.join('\n')
}

function generateReelPlan(profile) {
  return `Reel Plan for device K180324:\nScene 1: Introduction to device (show images, mention its use paragraphs)\nScene 2: Principle of Operation summary.\nScene 3: Highlight core components.\nScene 4: Discuss risks/warnings.\nScene 5: Maintenance tips.\n`}

async function main(){
  try{
    await p.$connect()
    const profile = await fetchProfile('K180324')
    const content = renderContent(profile)
    const reel = generateReelPlan(profile)
    console.log(content)
    console.log('--- REEL PLAN ---')
    console.log(reel)
  }catch(e){console.error(e)}finally{await p.$disconnect()}
}

// export helpers for testing
module.exports = {
  fetchProfile,
  renderContent,
  generateReelPlan,
  summarize,
  similarity
}

// run script only when executed directly
if (require.main === module) {
  main()
}
