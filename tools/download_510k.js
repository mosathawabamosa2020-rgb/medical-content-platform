const fs = require('fs')
const path = require('path')

async function download(kNumbers) {
  const dir = path.join(process.cwd(), 'data', 'incoming_pdfs')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  for (const k of kNumbers) {
    try {
      const digits = k.replace(/^K/i, '')
      const year = digits.slice(0, 2)
      const url = `https://www.accessdata.fda.gov/cdrh_docs/pdf${year}/K${digits}.pdf`
      const resp = await fetch(url)
      if (!resp.ok) {
        console.warn(`${k}: download failed status ${resp.status}`)
        continue
      }
      const buffer = await resp.arrayBuffer()
      const out = path.join(dir, `K${digits}.pdf`)
      fs.writeFileSync(out, Buffer.from(buffer))
      console.log(`${k}: saved to ${out}`)
    } catch (e) {
      console.warn(`${k}: error ${e.message}`)
    }
  }
}

const numbers = process.argv.slice(2)
if (!numbers.length) {
  console.error('Usage: node tools/download_510k.js K123456 K234567 ...')
  process.exit(1)
}

download(numbers).then(() => console.log('done')).catch(e => console.error(e))
