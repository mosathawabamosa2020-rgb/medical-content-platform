#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')

const BASE_URL = process.env.PROOF_BASE_URL || 'http://localhost:3000'
const SAMPLE_URLS = [
  'https://www.iana.org/domains/reserved',
  'https://www.rfc-editor.org/rfc/rfc2606',
  'https://www.rfc-editor.org/rfc/rfc6761',
  'https://www.wikipedia.org/',
  'https://www.fda.gov/',
]

async function ensureDevice(prisma) {
  let department = await prisma.department.findFirst({ where: { name: 'Proof Department' } })
  if (!department) {
    department = await prisma.department.create({ data: { name: 'Proof Department', description: 'Live proof department' } })
  }

  let device = await prisma.device.findFirst({ where: { name: 'Proof Device', model: 'Proof Model' } })
  if (!device) {
    device = await prisma.device.create({
      data: {
        name: 'Proof Device',
        model: 'Proof Model',
        departmentId: department.id,
        description: 'Live proof device',
      },
    })
  }

  return { department, device }
}

async function callIngest(url, deviceId) {
  const resp = await fetch(`${BASE_URL}/api/references/discovery/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE_URL,
    },
    body: JSON.stringify({ url, deviceId, title: `Proof ${url}` }),
  })
  let data = null
  try {
    data = await resp.json()
  } catch {
    data = null
  }
  return { status: resp.status, data }
}

async function main() {
  const prisma = new PrismaClient()
  const startedAt = new Date().toISOString()

  const { device } = await ensureDevice(prisma)
  const results = []
  const successes = []

  for (const url of SAMPLE_URLS) {
    const first = await callIngest(url, device.id)
    const second = await callIngest(url, device.id)
    results.push({ url, first, second })
    if (first.status === 201 || first.status === 200) {
      successes.push(url)
    }
    if (successes.length >= 2) break
  }

  const references = await prisma.reference.findMany({
    where: { deviceId: device.id, sourceUrl: { in: successes } },
    select: { id: true, sourceUrl: true, status: true, contentHash: true, uploadedAt: true },
  })

  await prisma.$disconnect()

  const proof = {
    startedAt,
    baseUrl: BASE_URL,
    deviceId: device.id,
    sampleUrls: SAMPLE_URLS,
    successUrls: successes,
    results,
    references,
  }

  const fs = require('node:fs')
  const path = require('node:path')
  const outDir = path.join(process.cwd(), 'artifacts')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'live_multi_source_discovery_proof_2026-03-11.json')
  fs.writeFileSync(outPath, JSON.stringify(proof, null, 2), { encoding: 'utf8' })
  console.log(`Wrote proof artifact: ${outPath}`)
  console.log(JSON.stringify(proof, null, 2))
}

main().catch((err) => {
  console.error('live discovery proof failed', err)
  process.exit(1)
})
