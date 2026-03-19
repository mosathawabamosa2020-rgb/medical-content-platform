const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

require('dotenv').config()

const ROOT = process.cwd()
const DISCOVERY_PROOF_PATH = path.join(ROOT, 'artifacts', 'live_multi_source_discovery_proof_2026-03-11.json')
const OUTPUT_PATH = path.join(ROOT, 'artifacts', 'live_retrieval_visibility_proof_2026-03-11.json')
const DEFAULT_BASE_URL = 'http://localhost:3000'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function splitIntoSections(text, maxSections = 6) {
  if (!text) return []
  const raw = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return raw.slice(0, maxSections).map((content, index) => ({
    title: `Section ${index + 1}`,
    content,
    order: index + 1,
  }))
}

async function main() {
  const startedAt = new Date().toISOString()
  const proof = readJson(DISCOVERY_PROOF_PATH)
  const baseUrl = process.env.RETRIEVAL_PROOF_BASE_URL || proof.baseUrl || DEFAULT_BASE_URL
  const referenceIds = (proof.references || []).map((r) => r.id).filter(Boolean)

  const prisma = new PrismaClient()
  const updates = []
  const paging = []
  const visibility = {
    baseUrl,
    libraryRequests: [],
    libraryResponses: [],
    matches: [],
    error: null,
  }

  try {
    for (const referenceId of referenceIds) {
      const reference = await prisma.reference.findUnique({ where: { id: referenceId } })
      if (!reference) {
        updates.push({ referenceId, status: 'not_found' })
        continue
      }

      const sections = splitIntoSections(reference.parsedText || '')
      if (sections.length === 0) {
        updates.push({ referenceId, status: 'no_parsed_text' })
        continue
      }

      await prisma.section.deleteMany({ where: { referenceId } })
      for (const section of sections) {
        await prisma.section.create({
          data: {
            deviceId: reference.deviceId,
            referenceId,
            title: section.title,
            content: section.content,
            order: section.order,
          },
        })
      }

      const processingDate = new Date()
      await prisma.reference.update({
        where: { id: referenceId },
        data: {
          status: 'verified',
          processingDate,
        },
      })

      const updated = {
        referenceId,
        status: 'verified',
        sectionsCreated: sections.length,
        processingDate: processingDate.toISOString(),
      }
      updates.push(updated)

      const rankAhead = await prisma.reference.count({
        where: {
          status: 'verified',
          sections: { some: {} },
          uploadedAt: { gt: reference.uploadedAt },
        },
      })
      const page = Math.floor(rankAhead / 20) + 1
      paging.push({ referenceId, page, rankAhead })
    }

    try {
      const pages = [...new Set(paging.map((p) => p.page || 1))].slice(0, 3)
      for (const page of pages) {
        const libraryUrl = `${baseUrl}/api/references/library?limit=20&page=${page}`
        visibility.libraryRequests.push(libraryUrl)
        const res = await fetch(libraryUrl)
        const responsePayload = { status: res.status, items: [] }
        if (res.ok) {
          const payload = await res.json()
          responsePayload.items = (payload.items || []).map((item) => ({
            id: item.id,
            sourceUrl: item.sourceUrl,
            status: item.status,
          }))
          visibility.matches.push(
            ...responsePayload.items.filter((item) => referenceIds.includes(item.id))
          )
        } else {
          visibility.error = `Library endpoint returned ${res.status}`
        }
        visibility.libraryResponses.push(responsePayload)
      }
    } catch (err) {
      visibility.error = err?.message || String(err)
    }
  } finally {
    await prisma.$disconnect()
  }

  const output = {
    startedAt,
    baseUrl,
    inputProof: path.basename(DISCOVERY_PROOF_PATH),
    referenceIds,
    updates,
    paging,
    visibility,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`retrieval visibility proof written to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error('retrieval visibility proof failed', err)
  process.exit(1)
})
