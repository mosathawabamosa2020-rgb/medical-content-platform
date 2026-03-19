// TODO Phase-2: migrate to MinIO storageAdapter (lib/storage/storageAdapter.ts)
// TODO Phase-2: remove local uploads/ dependency for this script
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')
const fetch = require('node-fetch')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const logger = console

// Usage: node scripts/scrape_fda.js "chemistry analyzer"
const SEARCH_TERM = process.argv[2] || 'chemistry analyzer'
const BASE_URL = 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm'

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function run() {
  logger.info({ search: SEARCH_TERM }, 'Starting FDA 510(k) scraper')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })

  // The page has a form - fill in search term field name likely 'psearch' or similar.
  // We'll try common selectors and fallback to input by placeholder.
  try {
    // attempt common field
    const input = await page.$('input[name="psearch"]') || await page.$('input[placeholder*="Search"]') || await page.$('input[type="text"]')
    if (!input) throw new Error('Search input not found on page')
    await input.fill(SEARCH_TERM)
    // click the search button
    const btn = await page.$('input[type="submit"], button:has-text("Search")')
    if (btn) await btn.click()
    else await page.keyboard.press('Enter')
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to perform search')
    await browser.close()
    return
  }

  await page.waitForLoadState('domcontentloaded')
  await sleep(1000)

  // iterate results pages
  let pageIndex = 1
  while (true) {
    logger.info({ pageIndex }, 'Processing results page')
    // extract result rows - attempt to find table rows
    const rows = await page.$$eval('table tr', (trs) => trs.map(tr => tr.innerHTML))
    // crude extraction: look for links to summary pages
    const links = await page.$$eval('a', (as) => as.map(a => ({ href: a.href, text: a.innerText })))
    // filter links that go to PMN detail pages (contain 'pmn.cfm' or '/pmn/')
    const detailLinks = links.filter(l => l.href && (l.href.includes('pmn.cfm') || l.href.includes('/pmn/')))

    // for robustness, find rows containing 510(k) numbers via regex
    const anchors = await page.$$('a')
    for (const a of anchors) {
      try {
        const href = await a.getAttribute('href')
        const text = (await a.innerText()).trim()
        if (!href) continue
        // heuristic: link to detail contains 'pmn.cfm' and text contains k number or device name
        if (href.includes('pmn.cfm')) {
          const detailUrl = new URL(href, BASE_URL).toString()
          await processDetail(detailUrl)
          await sleep(500)
        }
      } catch (e) { /* ignore row errors */ }
    }

    // try to click 'Next' pagination link
    const next = await page.$('a:has-text("Next")') || await page.$('a[title="Next"]')
    if (next) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), next.click()])
      pageIndex++
      await sleep(800)
      continue
    }
    break
  }

  await browser.close()
  logger.info('Scraping completed')
}

async function processDetail(detailUrl) {
  try {
    logger.info({ detailUrl }, 'Visiting detail')
    const resp = await fetch(detailUrl)
    if (!resp.ok) {
      console.warn('Failed to fetch detail page:', resp.status)
      return
    }
    const html = await resp.text()
    // extract 510(k) number, device name, applicant, date received, and PDF link
    const kMatch = html.match(/(K\d{5,6}|k\d{5,6})/i)
    const kNumber = kMatch ? kMatch[0].toUpperCase() : null
    const nameMatch = html.match(/<b>Device Name:<\/b>\s*([^<\n]+)/i) || html.match(/<title>([^<]+)<\/title>/i)
    const deviceName = nameMatch ? nameMatch[1].trim() : null
    const applicantMatch = html.match(/<b>Applicant:\s*<\/b>\s*([^<\n]+)/i) || html.match(/Applicant:\s*<[^>]*>([^<]+)/i)
    const applicant = applicantMatch ? applicantMatch[1].trim() : null
    const dateMatch = html.match(/Date Received:\s*([^<\n]+)/i)
    const dateReceived = dateMatch ? dateMatch[1].trim() : null

    // find PDF link (Decision Summary / Summary)
    const pdfMatch = html.match(/href=\"([^\"]+\.pdf)\"/i)
    const pdfUrl = pdfMatch ? new URL(pdfMatch[1], detailUrl).toString() : null

    logger.info({ kNumber, deviceName, applicant, dateReceived, pdfUrl }, 'Detail extracted')

    if (!kNumber) return

    // check DB for existing reference by sourceUrl or device name (use kNumber as unique)
    const existing = await prisma.device.findFirst({ where: { OR: [{ name: deviceName || '' }, { model: kNumber }] } })
    if (existing) {
      logger.info({ kNumber }, 'Device exists, skipping creation')
      // still download PDF if not present
    } else {
      // create device record (store kNumber in model field)
      const created = await prisma.device.create({ data: { name: deviceName || kNumber, model: kNumber, description: `Imported from FDA 510(k)` } })
      logger.info({ deviceId: created.id }, 'Created device')
    }

    // download PDF and create Reference
    if (pdfUrl) {
      try {
        const r = await fetch(pdfUrl)
        if (r.ok) {
          const buffer = Buffer.from(await r.arrayBuffer())
          const uploadsDir = path.join(process.cwd(), 'uploads')
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
          const filename = `fda_${kNumber || Date.now()}.pdf`
          const filePath = path.join(uploadsDir, filename)
          fs.writeFileSync(filePath, buffer)

          // link to device
          const device = await prisma.device.findFirst({ where: { model: kNumber } })
          if (device) {
            await prisma.reference.create({ data: { deviceId: device.id, title: `FDA Summary ${kNumber}`, filePath, sourceUrl: pdfUrl } })
            logger.info({ deviceId: device.id, filePath }, 'Saved PDF and created Reference')
          }
        }
      } catch (e) { console.warn('PDF download error', e.message) }
    }

  } catch (e) {
    logger.error({ err: e.message }, 'processDetail error')
  }
}

run().catch((e) => { logger.error(e); process.exit(1) })
