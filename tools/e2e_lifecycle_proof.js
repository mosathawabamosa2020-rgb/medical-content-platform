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
const { searchContent } = require(path.join(process.cwd(), 'lib', 'services', 'search.service.ts'))

const prisma = new PrismaClient()

async function searchCurrentRunVerifiedChunks({ query, deviceId, referenceId, currentChunkIds }) {
  const hits = await searchContent(query, deviceId)
  if (!hits.length) return []

  const referenceIds = [...new Set(hits.map((hit) => hit.referenceId).filter(Boolean))]
  const references = await prisma.reference.findMany({
    where: { id: { in: referenceIds } },
    select: { id: true, status: true },
  })
  const verifiedReferenceIds = new Set(
    references
      .filter((ref) => ref.status === 'verified')
      .map((ref) => ref.id)
  )

  const currentChunkIdSet = new Set(currentChunkIds)
  return hits.filter((hit) =>
    hit.referenceId === referenceId &&
    currentChunkIdSet.has(hit.id) &&
    verifiedReferenceIds.has(hit.referenceId)
  )
}

async function main() {
  const stamp = Date.now()
  const token = `e2e-proof-${stamp}`
  const arabicToken = 'огибЩ'

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

  const sectionPayloads = [
    `This section includes ${token} for lifecycle validation.`,
    `Clinical safety checklist for ${token} and routine operation.`,
    `English explanation: catheter insertion workflow aligned with ${arabicToken} terminology.`,
    `Maintenance protocol and calibration safeguards for ${token}.`,
    `Troubleshooting matrix with verification notes for ${token}.`,
  ]

  const sectionIds = []
  const chunkIds = []
  for (let i = 0; i < sectionPayloads.length; i += 1) {
    const sectionId = `sec-${stamp}-${i + 1}`
    await prisma.section.create({
      data: {
        id: sectionId,
        deviceId: device.id,
        referenceId: reference.id,
        title: `E2E Section ${i + 1}`,
        content: sectionPayloads[i],
        order: i + 1,
      },
    })

    const createdChunk = await prisma.knowledgeChunk.create({
      data: {
        referenceId: reference.id,
        content: sectionPayloads[i],
        category: 'GENERAL',
        pageNumber: i + 1,
        language: 'en',
      },
      select: { id: true },
    })

    sectionIds.push(sectionId)
    chunkIds.push(createdChunk.id)
  }

  const preSearch = await searchCurrentRunVerifiedChunks({
    query: token,
    deviceId: device.id,
    referenceId: reference.id,
    currentChunkIds: chunkIds,
  })

  const decision = await applyReferenceVerificationDecision(prisma, reference.id, reviewer.id, {
    decision: 'approved',
    comment: 'E2E lifecycle approval',
  })

  const verifiedRows = await prisma.knowledgeChunk.findMany({
    where: {
      referenceId: reference.id,
      reference: { status: 'verified' },
    },
    orderBy: { pageNumber: 'asc' },
    take: 8,
    select: {
      id: true,
      content: true,
      referenceId: true,
      reference: { select: { title: true } },
    },
  })

  const generated = await buildGeneratedContent(
    {
      topic: 'E2E lifecycle device post',
      tone: 'professional',
      platform: 'x',
      contentType: 'scientific_device',
      includeReel: true,
    },
    verifiedRows.map((row) => ({
      snippet: row.content,
      reference: { id: row.referenceId, title: row.reference?.title || null },
    }))
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

  const postSearch = await searchCurrentRunVerifiedChunks({
    query: token,
    deviceId: device.id,
    referenceId: reference.id,
    currentChunkIds: chunkIds,
  })

  const bilingualSearch = await searchCurrentRunVerifiedChunks({
    query: arabicToken,
    deviceId: device.id,
    referenceId: reference.id,
    currentChunkIds: chunkIds,
  })

  const sectionsForReference = await prisma.section.count({ where: { referenceId: reference.id } })

  const payload = {
    generatedAt: new Date().toISOString(),
    token,
    created: {
      reviewerId: reviewer.id,
      deviceId: device.id,
      referenceId: reference.id,
      generatedContentId: generatedContent.id,
      sectionIds,
      chunkIds,
    },
    sectionCountForReference: sectionsForReference,
    preApproveSearchResults: preSearch.length,
    approvalDecisionResult: decision,
    postApproveSearchResults: postSearch.length,
    retrievalGuards: {
      allPostApproveHitsBelongToCurrentRun: postSearch.every((row) => row.referenceId === reference.id && chunkIds.includes(row.id)),
      allBilingualHitsBelongToCurrentRun: bilingualSearch.every((row) => row.referenceId === reference.id && chunkIds.includes(row.id)),
    },
    bilingualProof: {
      query: arabicToken,
      postApproveHits: bilingualSearch.length,
      sampleEnglishSnippet: bilingualSearch[0]?.content || null,
    },
    generatedContentEvidence: {
      generatedContentId: generatedContent.id,
      sourceReferenceIds: generated.references || [],
      sourceChunkIds: verifiedRows.map((row) => row.id),
    },
    postApproveReferenceStatus: (await prisma.reference.findUnique({ where: { id: reference.id } }))?.status || null,
  }

  const outPath = path.join(process.cwd(), 'artifacts', 'e2e_lifecycle_proof.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
  console.log(JSON.stringify(payload, null, 2))
  console.log(`Wrote E2E proof artifact: ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
