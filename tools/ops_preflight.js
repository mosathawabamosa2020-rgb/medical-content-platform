#!/usr/bin/env node
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })
const { getReadinessSnapshot } = require('../lib/ops/readiness')

function icon(status) {
  if (status === 'ok') return 'OK'
  if (status === 'degraded') return 'DEGRADED'
  if (status === 'blocked') return 'BLOCKED'
  if (status === 'not_configured') return 'NOT_CONFIGURED'
  return 'ERROR'
}

async function main() {
  const snapshot = await getReadinessSnapshot()
  console.log('Startup Preflight Diagnostics')
  console.log(`GeneratedAt: ${snapshot.generatedAt}`)
  console.log(`Overall: ${icon(snapshot.overallStatus)}`)
  console.log('')
  for (const [key, check] of Object.entries(snapshot.checks)) {
    console.log(`[${icon(check.status)}] ${key} | required=${check.required ? 'yes' : 'no'} | ${check.message}`)
    if (check.classification) {
      console.log(`  - classification: ${check.classification}`)
    }
    if (check.remediation) {
      console.log(`  - remediation: ${check.remediation}`)
    }
  }
  console.log('')
  console.log('Details (full snapshot JSON):')
  console.log(JSON.stringify(snapshot, null, 2))

  if (snapshot.overallStatus === 'blocked') process.exit(1)
}

main().catch((err) => {
  console.error('preflight failed', err)
  process.exit(1)
})
