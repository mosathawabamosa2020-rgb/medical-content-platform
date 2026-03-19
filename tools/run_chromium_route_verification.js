#!/usr/bin/env node
const { chromium } = require('playwright')

const BASE_URL = process.env.PROOF_BASE_URL || 'http://127.0.0.1:3000'
const ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/taxonomy',
  '/admin/references',
  '/admin/verification',
  '/admin/settings',
  '/devices',
  '/library',
  '/search',
]

async function run() {
  const browser = await chromium.launch()
  const results = []

  for (const route of ROUTES) {
    const page = await browser.newPage()
    const consoleErrors = []
    const pageErrors = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => pageErrors.push(err.message))

    let status = null
    let ok = false
    let finalUrl = null

    try {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      status = response ? response.status() : null
      ok = Boolean(response && response.ok())
      finalUrl = page.url()
    } catch (err) {
      pageErrors.push(err.message || String(err))
    }

    results.push({
      route,
      status,
      ok,
      finalUrl,
      consoleErrors,
      pageErrors,
    })

    await page.close()
  }

  await browser.close()

  const fs = require('node:fs')
  const path = require('node:path')
  const outDir = path.join(process.cwd(), 'artifacts')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'chromium_route_verification_2026-03-12.json')
  fs.writeFileSync(outPath, JSON.stringify({ baseUrl: BASE_URL, results }, null, 2), 'utf8')
  console.log(`Wrote Chromium verification artifact: ${outPath}`)
  console.log(JSON.stringify({ baseUrl: BASE_URL, results }, null, 2))
}

run().catch((err) => {
  console.error('chromium verification failed', err)
  process.exit(1)
})
