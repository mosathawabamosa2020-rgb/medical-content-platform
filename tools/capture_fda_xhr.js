const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const BASE_URL = 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm'
const TERM = process.argv[2] || 'chemistry analyzer'
const OUT = path.join(process.cwd(), 'data', 'fda_xhr_capture.json')

async function main() {
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'))
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  const captures = []

  page.on('request', (req) => {
    // noop or could log
  })

  page.on('response', async (res) => {
    try {
      const req = res.request()
      const url = req.url()
      const resource = req.resourceType()
      // only inspect XHR/fetch or json/text responses
      if (resource !== 'xhr' && resource !== 'fetch' && !/pmn|search|api/i.test(url)) return
      const ct = res.headers()['content-type'] || ''
      let text = ''
      try { text = await res.text() } catch (e) { text = '' }
      if (!text) return
      // look for K numbers or PMN markers
      if (/K\d{5,6}/i.test(text) || /pmn\.cfm/i.test(text) || /kNumber|kNumber/i.test(text) || /"kNumber"/i.test(text)) {
        const capture = {
          url,
          resource,
          status: res.status(),
          request: {
            method: req.method(),
            headers: req.headers(),
            postData: req.postData()
          },
          responsePreview: text.slice(0, 2000),
        }
        console.log('=== MATCHED RESPONSE ===', url)
        console.log(capture.responsePreview)
        captures.push(capture)
        fs.writeFileSync(OUT, JSON.stringify(captures, null, 2))
      }
    } catch (e) {
      console.error('response handler error', e)
    }
  })

  console.log('Opening PMN search page...')
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })

  // try to find search input
  const selectors = ['input[name="psearch"]', 'input[placeholder*="Search"]', 'input[type="text"]']
  let input = null
  for (const s of selectors) {
    try { input = await page.$(s); if (input) break } catch (e) {}
  }

  if (!input) {
    console.warn('Search input not found via selectors, attempting form submit fallback')
    // try submit the first form's input via evaluate
    await page.evaluate((term) => {
      const f = document.querySelector('form')
      if (!f) return
      const input = f.querySelector('input[type=text], input[name=psearch]')
      if (input) input.value = term
      try { f.submit() } catch (e) { /* ignore */ }
    }, TERM)
  } else {
    console.log('Filling search term:', TERM)
    await input.fill(TERM)
    // click submit if present
    const btn = await page.$('input[type="submit"], button:has-text("Search")')
    if (btn) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }), btn.click()])
    } else {
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }), page.keyboard.press('Enter')])
    }
  }

  console.log('Search submitted — waiting 10s for XHRs to complete...')
  await page.waitForTimeout(10000)

  console.log('Done waiting — saved matches to', OUT)
  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
