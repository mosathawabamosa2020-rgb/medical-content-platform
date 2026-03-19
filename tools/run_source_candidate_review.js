#!/usr/bin/env node
const { chromium } = require('playwright')

const CANDIDATES = [
  'https://www.scribd.com/',
  'https://www.ai-websites1.com/',
  'https://www.emro.who.int/',
  'https://tvtc.gov.sa/',
  'https://pubrica.com/',
  'https://www.noor-book.com/',
  'https://rayatgrup.com/',
  'https://frankshospitalworkshop.com/',
  'https://bmegtu.wordpress.com/',
  'https://www.freebookcentre.net/',
  'http://ijlalhaider.pbworks.com/',
  'https://www.sciencedirect.com/',
  'https://dokumen.pub/',
  'https://www.cambridge.org/',
  'https://link.springer.com/',
  'https://www.bspublications.com/',
  'https://ar.wikipedia.org/',
]

async function run() {
  const browser = await chromium.launch()
  const results = []

  for (const url of CANDIDATES) {
    const page = await browser.newPage()
    const pageErrors = []

    page.on('pageerror', (err) => pageErrors.push(err.message))

    let status = null
    let ok = false
    let finalUrl = null

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      status = response ? response.status() : null
      ok = Boolean(response && response.ok())
      finalUrl = page.url()
    } catch (err) {
      pageErrors.push(err.message || String(err))
    }

    results.push({ url, status, ok, finalUrl, pageErrors })
    await page.close()
  }

  await browser.close()

  const fs = require('node:fs')
  const path = require('node:path')
  const outDir = path.join(process.cwd(), 'artifacts')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'source_candidate_browser_review_2026-03-12.json')
  fs.writeFileSync(outPath, JSON.stringify({ results }, null, 2), 'utf8')
  console.log(`Wrote source candidate review artifact: ${outPath}`)
  console.log(JSON.stringify({ results }, null, 2))
}

run().catch((err) => {
  console.error('source candidate review failed', err)
  process.exit(1)
})
