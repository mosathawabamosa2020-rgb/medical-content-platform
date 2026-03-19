require('dotenv').config({ path: '.env.local' })
const path = require('path')

const input = process.argv.slice(2).join(' ')
if (!input) {
  console.error('Usage: node tools/run_master_scraper.js "K123456 K234567"')
  process.exit(1)
}

async function main() {
  const modPath = path.join(process.cwd(), 'dist', 'scripts', 'master_scraper.js')
  const mod = require(modPath)
  const fn = mod.runScraper || mod.default || mod
  if (typeof fn !== 'function') {
    console.error('runScraper function not found in', modPath)
    process.exit(1)
  }
  try {
    await fn(input)
    console.log('runScraper completed')
  } catch (e) {
    console.error('runScraper error', e && e.stack || e)
    process.exit(1)
  }
}

main()
