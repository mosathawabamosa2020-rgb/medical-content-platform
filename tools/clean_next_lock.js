const fs = require('fs')
const path = require('path')

const lockPath = path.join(process.cwd(), '.next-build', 'lock')

try {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath)
    console.log(`Removed stale build lock: ${lockPath}`)
  }
} catch (err) {
  console.warn('Could not remove .next-build lock file:', err?.message || err)
}
