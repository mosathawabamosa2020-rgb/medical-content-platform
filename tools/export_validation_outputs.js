#!/usr/bin/env node
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const COMMANDS = [
  'npx prisma generate',
  'npx prisma migrate deploy',
  'npx prisma migrate status',
  'npm run typecheck',
  'npm run lint',
  'npm test -- --runInBand',
  'npm run build',
]

function runCommand(cmd) {
  const result = spawnSync(cmd, {
    shell: true,
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
    env: process.env,
  })

  return {
    command: cmd,
    exitCode: result.status == null ? 1 : result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  }
}

function main() {
  const dateTag = new Date().toISOString().slice(0, 10)
  const outputPath = path.join(process.cwd(), 'artifacts', `group_d_validation_outputs_${dateTag}.txt`)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  let output = ''
  output += `GeneratedAt: ${new Date().toISOString()}\n`
  output += `Node: ${process.version}\n`
  output += `Platform: ${process.platform}\n\n`

  let hasFailure = false

  for (const cmd of COMMANDS) {
    const r = runCommand(cmd)
    if (r.exitCode !== 0) hasFailure = true
    output += `$ ${r.command}\n`
    output += `exit_code: ${r.exitCode}\n`
    output += `stdout:\n${r.stdout}\n`
    output += `stderr:\n${r.stderr}\n`
    output += `${'='.repeat(120)}\n\n`
  }

  fs.writeFileSync(outputPath, output, { encoding: 'utf8' })
  console.log(`Wrote clean UTF-8 validation artifact: ${outputPath}`)

  process.exit(hasFailure ? 1 : 0)
}

main()
