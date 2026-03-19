const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('STARTING: navigating to FDA 510k page')
  await page.goto('https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm', { waitUntil: 'domcontentloaded', timeout: 120000 })

  page.on('request', request => {
    const url = request.url();
    const resourceType = request.resourceType();
    if (resourceType === 'xhr' || resourceType === 'fetch') {
      console.log('REQUEST:', request.method(), url)
    }
  })

  page.on('response', async response => {
    try {
      const req = response.request();
      const url = response.url();
      const resourceType = req.resourceType && req.resourceType()
      if (resourceType === 'xhr' || resourceType === 'fetch' || /search|pmn|results/i.test(url)) {
        console.log('RESPONSE:', response.status(), url)
        const ct = response.headers()['content-type'] || ''
        if (ct.includes('application/json')) {
          const body = await response.text()
          console.log('JSON_BODY_START')
          console.log(body.substring(0, 8000))
          console.log('JSON_BODY_END')
        } else {
          // print small HTML fragments
          const txt = await response.text().catch(e => '')
          if (txt && txt.length < 2000) console.log('HTML_BODY:', txt.substring(0, 2000))
        }
      }
    } catch (e) {
      console.error('response handler error', e)
    }
  })

  // Focus the search input and type the term, then submit the form
  const term = 'chemistry analyzer'
  await page.fill('input[name="psearch"]', term)
  // Click search
  const btn = await page.$('input[type="submit"], button:has-text("Search")')
  if (btn) {
    await Promise.all([
      page.waitForResponse(r => r.status() === 200, { timeout: 20000 }).catch(() => null),
      btn.click()
    ])
  } else {
    await Promise.all([
      page.waitForResponse(r => r.status() === 200, { timeout: 20000 }).catch(() => null),
      page.keyboard.press('Enter')
    ])
  }

  console.log('Submitted search; waiting 8s to capture network activity...')
  await page.waitForTimeout(8000)

  console.log('DONE_CAPTURE')
  await browser.close()
  process.exit(0)
})()
