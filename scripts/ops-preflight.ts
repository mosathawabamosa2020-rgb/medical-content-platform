import { spawnSync } from 'node:child_process'

const result = spawnSync(process.execPath, ['tools/ops_preflight.js'], {
  stdio: 'inherit',
  cwd: process.cwd(),
})

process.exit(result.status ?? 1)

