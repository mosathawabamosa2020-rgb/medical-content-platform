require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const { PrismaClient } = require('@prisma/client')

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

const { applyReferenceVerificationDecision } = require(path.join(process.cwd(), 'lib', 'services', 'verificationService.ts'))
const { buildGeneratedContent } = require(path.join(process.cwd(), 'lib', 'services', 'contentGeneration.ts'))

const prisma = new PrismaClient()

function normalizeL2(vec) {
  let s = 0
  for (const v of vec) s += v * v
  const n = Math.sqrt(s) || 1
  return vec.map((v) => v / n)
}

function localEmbedding(text, dim = 1536) {
  const out = new Array(dim).fill(0)
  let seed = 2166136261
  const input = (text || '').toLowerCase()
  for (let i = 0; i < input.length; i += 1) {
    seed ^= input.charCodeAt(i)
    seed = Math.imul(seed, 16777619)
    out[Math.abs(seed) % dim] += ((seed >>> 0) % 2000) / 1000 - 1
  }
  return normalizeL2(out)
}

async function searchByToken(token) {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT s.id, s."referenceId", r.status
    FROM "Section" s
    JOIN "Reference" r ON r.id = s."referenceId"
    WHERE s.content ILIKE '%${token}%'
      AND r.status = 'verified'
    LIMIT 10
  `)
  return rows
}

async function main() {
  const stamp = Date.now()
  const token = `e2e-proof-${stamp}`
  const reviewer = await prisma.user.upsert({
    where: { email: `reviewer+${stamp}@example.test` },
    update: {},
    create: {
      email: `reviewer+${stamp}@example.test`,
      password: 'hashed-placeholder',
      role: 'reviewer',
      name: 'E2E Reviewer',
    },
  })
  const device = await prisma.device.create({
    data: { name: `E2E Device ${stamp}`, model: `M-${stamp}`, description: 'Lifecycle proof device' },
  })
  const file = await prisma.file.create({
    data: { filename: `e2e-${stamp}.txt`, mimeType: 'text/plain', path: `/tmp/e2e-${stamp}.txt`, sizeBytes: 1200 },
  })
  const reference = await prisma.reference.create({
    data: {
      deviceId: device.id,
      fileId: file.id,
      title: `E2E Reference ${stamp}`,
      status: 'pending_review',
      sourceName: 'E2E',
      sourceUrl: 'https://example.test/e2e',
      parsedText: `This reference contains ${token} evidence.`,
      contentHash: `sha256-${stamp}`,
    },
  })
  const emb = localEmbedding(`This reference contains ${token} evidence.`)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Section" ("id","deviceId","referenceId","title","content","order","embedding","createdAt")
    VALUES ('sec-${stamp}','${device.id}','${reference.id}','E2E Section','This section includes ${token} for lifecycle validation',1,'[${emb.join(',')}]'::vector,NOW())
  `)

  const preSearch = await searchByToken(token)

  const verifiedRows = await prisma.$queryRawUnsafe(`
    SELECT s.content AS snippet, r.id AS "referenceId", r.title
    FROM "Section" s
    JOIN "Reference" r ON r.id = s."referenceId"
    WHERE r.status = 'verified'
    LIMIT 8
  `)
  const generated = await buildGeneratedContent(
    { topic: 'E2E lifecycle device post', tone: 'professional', platform: 'x', contentType: 'scientific_device', includeReel: true },
    verifiedRows.map((x) => ({ snippet: x.snippet, reference: { id: x.referenceId, title: x.title || null } }))
  )
  const generatedContent = await prisma.generatedContent.create({
    data: {
      userId: reviewer.id,
      contentType: generated.contentType,
      topic: 'E2E lifecycle device post',
      tone: 'professional',
      platform: 'x',
      script: generated.script,
      caption: generated.caption,
      hashtags: generated.hashtags,
      voiceoverText: generated.voiceoverText,
      imageSourceUrl: generated.imageSourceUrl,
      imagePrompt: generated.imagePrompt,
      topKUsed: 8,
      probeUsed: 20,
      generationCostEstimate: 0,
      tokenUsageInput: 0,
      tokenUsageOutput: 0,
      generationLatencyMs: 0,
      retrievalLatencyMs: 0,
      failureCode: generated.failureCode,
      retryCount: 0,
      references: { create: (generated.references || []).map((referenceId) => ({ referenceId })) },
    },
  })

  const decision = await applyReferenceVerificationDecision(prisma, reference.id, reviewer.id, {
    decision: 'approved',
    comment: 'E2E lifecycle approval',
  })

  const postSearch = await searchByToken(token)

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    token,
    created: {
      reviewerId: reviewer.id,
      deviceId: device.id,
      referenceId: reference.id,
      generatedContentId: generatedContent.id,
    },
    preApproveSearchResults: preSearch.length,
    approvalDecisionResult: decision,
    postApproveSearchResults: postSearch.length,
    postApproveReferenceStatus: (await prisma.reference.findUnique({ where: { id: reference.id } }))?.status || null,
  }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
