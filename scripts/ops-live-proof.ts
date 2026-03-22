import { spawnSync } from 'node:child_process'

const result = spawnSync(process.execPath, ['tools/run_live_discovery_proof.js'], {
  stdio: 'inherit',
  cwd: process.cwd(),
})

process.exit(result.status ?? 1)
