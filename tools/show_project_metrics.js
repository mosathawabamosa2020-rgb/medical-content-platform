require('dotenv').config({ path: '.env.local' })
const { computeMetrics } = require('../lib/services/MetricsService')

async function mainCli() {
  try {
    const m = await computeMetrics()
    console.log('=== Project Metrics ===')
    console.log('Total Devices Processed:', m.deviceCount)
    console.log('Total Articles Aggregated:', m.articleCount)
    console.log('Total Sections Extracted:', m.sectionCount)
    // section statuses no longer tracked; only counts are available
    console.log('(section-level status data deprecated)')
    console.log('=======================')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

module.exports = { computeMetrics }

if (require.main === module) {
  mainCli()
}
