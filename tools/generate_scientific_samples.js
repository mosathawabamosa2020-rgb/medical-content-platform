require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const { Pool } = require('pg')

require.extensions['.ts'] = function transpileTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8')
  const out = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: filename,
  }).outputText
  module._compile(out, filename)
}

const { buildGeneratedContent } = require(path.join(process.cwd(), 'lib', 'services', 'contentGeneration.ts'))
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 })

const SAMPLES = [
  { category: 'Laboratory instrument', topic: 'PCR Thermocycler', pattern: 'pcr|thermocycler|laboratory|assay' },
  { category: 'Imaging device', topic: 'MRI Scanner', pattern: 'mri|imaging|scanner|radiology' },
  { category: 'Analytical instrument', topic: 'Gas Chromatograph', pattern: 'chromatograph|analytical|spectrometry|analysis' },
]

async function fetchContext(pattern) {
  const r = await pool.query(`
    SELECT s.content AS snippet, r.id AS "referenceId", r.title
    FROM "Section" s
    JOIN "Reference" r ON r.id = s."referenceId"
    WHERE r.status = 'verified' AND s.content ILIKE $1
    LIMIT 12
  `, [`%${pattern.split('|')[0]}%`])
  if (r.rows.length >= 6) return r.rows
  const fallback = await pool.query(`
    SELECT s.content AS snippet, r.id AS "referenceId", r.title
    FROM "Section" s
    JOIN "Reference" r ON r.id = s."referenceId"
    WHERE r.status = 'verified'
    LIMIT 12
  `)
  return fallback.rows
}

async function main() {
  const out = []
  for (const sample of SAMPLES) {
    const rows = await fetchContext(sample.pattern)
    const retrievalResults = rows.map((x) => ({
      snippet: String(x.snippet || '').slice(0, 500),
      reference: { id: x.referenceId, title: x.title || null },
    }))
    const generated = await buildGeneratedContent(
      {
        topic: sample.topic,
        tone: 'professional',
        platform: 'instagram',
        contentType: 'scientific_device',
        includeReel: true,
      },
      retrievalResults
    )

    const scriptParagraphs = String(generated.script || '').split(/\n\n+/).filter(Boolean)
    const citations = generated.citationTrace || []
    const citationPass = scriptParagraphs.length > 0 && citations.length >= Math.min(6, scriptParagraphs.length) && citations.every((c) => Array.isArray(c.referenceIds) && c.referenceIds.length > 0)

    out.push({
      category: sample.category,
      topic: sample.topic,
      script: generated.script,
      caption: generated.caption,
      hashtags: generated.hashtags,
      voiceoverText: generated.voiceoverText,
      reel: generated.reel,
      imageSourceUrl: generated.imageSourceUrl,
      imagePrompt: generated.imagePrompt,
      citationTrace: citations,
      citationIntegrityPass: citationPass,
    })
  }
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), samples: out }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await pool.end()
})
