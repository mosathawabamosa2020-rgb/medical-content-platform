const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('STARTING: navigating to FDA 510k page')
  await page.goto('https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm', { waitUntil: 'domcontentloaded', timeout: 120000 })

  page.on('response', async response => {
    try {
      const url = response.url()
      const status = response.status()
      const text = await response.text().catch(() => '')
      if (text && /K\d{5,6}/i.test(text)) {
        console.log('MATCH_RESPONSE', status, url)
        const match = text.match(/K\d{5,6}/ig)
        console.log('FOUND_KS', match)
        console.log('BODY_SNIPPET:', text.substring(0, 8000))
      }
    } catch (e) { }
  })

  // attempt typing and submitting via JS to trigger any XHRs
  const term = 'chemistry analyzer'
  await page.evaluate((t) => {
    const inp = document.querySelector('input[name="psearch"]') || document.querySelector('input[type="text"]')
    if (inp) { inp.value = t }
    const form = document.querySelector('form')
    if (form) form.submit()
  }, term)

  console.log('Submitted search via form.submit(); waiting 8s')
  await page.waitForTimeout(8000)

  console.log('DONE_CAPTURE')
  await browser.close()
  process.exit(0)
})()
