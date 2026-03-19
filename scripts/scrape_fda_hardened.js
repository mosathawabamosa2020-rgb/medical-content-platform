// TODO Phase-2: migrate to MinIO storageAdapter (lib/storage/storageAdapter.ts)
/**
 * Hardened FDA 510(k) scraper for Project Apollo
 * - robots.txt check
 * - rate limiting
 * - resumable state (data/scrape_state.json)
 * - integrates with local embedding pipeline (OpenAI embeddings) and saves vectors to data/vectors.json
 * - saves PDFs to uploads/ and creates Reference entries in DB
 *
 * Usage:
 *   node scripts/scrape_fda_hardened.js "chemistry analyzer"
 */
// TODO Phase-2: remove local uploads/ dependency for this script

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const { chromium } = require('playwright')
const pdf = require('pdf-parse')
const { PrismaClient } = require('@prisma/client')

function loadLogger() {
  try {
    const mod = require(path.join(process.cwd(), 'lib', 'logger'))
    return mod.default || mod
  } catch {
    try {
      const mod = require(path.join(process.cwd(), 'dist', 'lib', 'logger'))
      return mod.default || mod
    } catch {
      return console
    }
  }
}

function loadEmbeddingsLib() {
  try {
    return require(path.join(process.cwd(), 'lib', 'embeddings'))
  } catch {
    return require(path.join(process.cwd(), 'dist', 'lib', 'embeddings'))
  }
}

const prisma = new PrismaClient()
const logger = loadLogger()
const { embedText, saveSectionEmbedding } = loadEmbeddingsLib()

const BASE_HOST = 'https://www.accessdata.fda.gov'
const BASE_URL = `${BASE_HOST}/scripts/cdrh/cfdocs/cfPMN/pmn.cfm`
const SEARCH_TERM = process.argv[2] || 'chemistry analyzer'
const DELAY_MS = parseInt(process.env.SCRAPER_DELAY_MS || '1200', 10)
const STATE_PATH = path.join(process.cwd(), 'data', 'scrape_state.json')
const STOP_FLAG = path.join(process.cwd(), 'data', 'scraper_stop.flag')

function ensureDataFiles() {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  if (!fs.existsSync(STATE_PATH)) fs.writeFileSync(STATE_PATH, JSON.stringify({ processedDetails: [], lastSearch: null, lastPageUrl: null }, null, 2))
}

function loadState() {
  ensureDataFiles()
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

// vector storage is now in DB via manual migrations / raw SQL; no local vector store

async function fetchRobots() {
  try {
    const r = await fetch(BASE_HOST + '/robots.txt')
    if (!r.ok) return null
    const txt = await r.text()
    return txt
  } catch (e) { return null }
}

function isAllowedByRobots(robotsTxt, url) {
  if (!robotsTxt) return true
  // very small parser: find User-agent: * section and Disallow lines
  const lines = robotsTxt.split(/\r?\n/).map(l => l.trim())
  let inStar = false
  const disallows = []
  for (const l of lines) {
    if (!l) continue
    if (/^User-agent:\s*\*/i.test(l)) { inStar = true; continue }
    if (/^User-agent:/i.test(l) && inStar) break
    if (inStar && /^Disallow:/i.test(l)) {
      const p = l.split(':')[1].trim()
      disallows.push(p)
    }
  }
  try {
    const u = new URL(url)
    const pathName = u.pathname
    for (const d of disallows) {
      if (!d) continue
      if (pathName.startsWith(d)) return false
    }
    return true
  } catch (e) { return false }
}

// Use shared embeddings helper for scripts
let embedLib = null
function ensureEmbedLib() {
  if (!embedLib) embedLib = loadEmbeddingsLib()
  return embedLib
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i] }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-10)
}

async function parseAndIndexPdf(buffer, deviceId, referenceId, kNumber) {
  try {
    const data = await pdf(buffer)
    const text = data.text || ''
    const pages = text.split('\f').map(p => p.trim()).filter(Boolean)
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY missing')
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i]
      if (!pageText) continue
      const embedHelper = ensureEmbedLib()
      let section = null
      try {
        section = await prisma.section.create({
          data: {
            deviceId,
            referenceId,
            title: `Page ${i + 1}`,
            content: pageText,
            order: i + 1,
          },
        })
      } catch (e) {
        logger.error({ err: e.message, referenceId }, 'Failed to create section for embedding')
      }
      if (section) {
        const emb = await embedHelper.embedText(pageText)
        try {
          await embedHelper.saveSectionEmbedding(section.id, emb)
        } catch (e) {
          logger.error({ err: e.message, referenceId, sectionId: section.id }, 'Failed to update section embedding')
        }
      }
      // polite delay
      await new Promise(r => setTimeout(r, 200))
    }
    return { indexedPages: pages.length }
  } catch (e) {
    logger.warn({ err: e.message }, 'parseAndIndexPdf error')
    return { indexedPages: 0 }
  }
}

async function runOnce(searchTerm) {
  ensureDataFiles()
  const robots = await fetchRobots()
  if (!isAllowedByRobots(robots, BASE_URL)) {
    logger.error('Crawling disallowed by robots.txt for %s', BASE_URL)
    return
  }

  const state = loadState()
  state.lastSearch = searchTerm
  saveState(state)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  // fill search
  const input = await page.$('input[name="psearch"]') || await page.$('input[placeholder*="Search"]') || await page.$('input[type="text"]')
  if (!input) { logger.error('Search input not found'); await browser.close(); return }
  await input.fill(searchTerm)
  const btn = await page.$('input[type="submit"], button:has-text("Search")')
  if (btn) await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), btn.click()])
  else await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.keyboard.press('Enter')])

  // iterate pagination
  while (true) {
    // check stop flag
    if (fs.existsSync(STOP_FLAG)) { console.log('Stop flag detected; exiting'); break }

    // extract detail links by finding anchors to pmn.cfm
    const anchors = await page.$$eval('a', as => as.map(a => ({ href: a.href, text: a.innerText })))
    const detailUrls = anchors.filter(a => a.href && a.href.includes('pmn.cfm')).map(a => a.href)

    for (const detailUrl of detailUrls) {
      if (state.processedDetails && state.processedDetails.includes(detailUrl)) { continue }
      try {
        logger.info({ detailUrl }, 'Processing')
        // fetch detail page HTML (safer than navigation to avoid complex JS)
        const resp = await fetch(detailUrl)
        if (!resp.ok) { console.warn('Failed to fetch detail', resp.status); continue }
        const html = await resp.text()
        const kMatch = html.match(/(K\d{5,6}|k\d{5,6})/i)
        const kNumber = kMatch ? kMatch[0].toUpperCase() : null
        const nameMatch = html.match(/<b>Device Name:<\/b>\s*([^<\n]+)/i) || html.match(/<title>([^<]+)<\/title>/i)
        const deviceName = nameMatch ? nameMatch[1].trim() : null
        const pdfMatch = html.match(/href=\"([^\"]+\.pdf)\"/i)
        const pdfUrl = pdfMatch ? new URL(pdfMatch[1], detailUrl).toString() : null

        if (!kNumber) {
          logger.info({ detailUrl }, 'No K number found, skipping')
          state.processedDetails.push(detailUrl); saveState(state); continue
        }

        // check DB for existing device by model==kNumber
        let device = await prisma.device.findFirst({ where: { model: kNumber } })
        if (!device) {
          device = await prisma.device.create({ data: { name: deviceName || kNumber, model: kNumber, description: `Imported from FDA 510(k)` } })
          logger.info({ deviceId: device.id }, 'Created device')
        } else {
          logger.info({ deviceId: device.id }, 'Device already exists')
        }

        // download pdf
        if (pdfUrl) {
          try {
            const r = await fetch(pdfUrl)
            if (r.ok) {
              const buffer = Buffer.from(await r.arrayBuffer())
              const uploadsDir = path.join(process.cwd(), 'uploads')
              if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
              const filename = `fda_${kNumber}_${Date.now()}.pdf`
              const filePath = path.join(uploadsDir, filename)
              fs.writeFileSync(filePath, buffer)
              const ref = await prisma.reference.create({ data: { deviceId: device.id, title: `FDA Summary ${kNumber}`, filePath, sourceUrl: pdfUrl } })
              logger.info({ filePath, referenceId: ref.id }, 'Saved PDF')
              // parse & index
              const { indexedPages } = await parseAndIndexPdf(buffer, device.id, ref.id, kNumber)
              logger.info({ indexedPages, referenceId: ref.id }, 'Indexed pages')
            }
          } catch (e) { console.warn('PDF download error', e.message) }
        }

        state.processedDetails.push(detailUrl)
        saveState(state)
        await new Promise(r => setTimeout(r, DELAY_MS))
      } catch (e) {
        logger.warn({ err: e.message }, 'detail processing error')
      }
    }

    // try pagination - look for Next
    const nextHandle = await page.$('a:has-text("Next")') || await page.$('a[title="Next"]')
    if (nextHandle) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), nextHandle.click()])
      await new Promise(r => setTimeout(r, 800))
      continue
    }
    break
  }

  await browser.close()
}

(async () => {
  try {
    await runOnce(SEARCH_TERM)
    console.log('Hardened scrape finished')
  } catch (e) {
    console.error('Scraper error', e)
    process.exit(1)
  }
})()
