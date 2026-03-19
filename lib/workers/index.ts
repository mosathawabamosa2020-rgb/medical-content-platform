import logger from '../logger'
import { runIngestionWorker } from './ingestionWorker'

let shuttingDown = false

async function tick() {
  if (shuttingDown) return
  try {
    await runIngestionWorker()
  } catch (err) {
    logger.error({ err }, 'worker tick failed')
  }
}

async function main() {
  logger.info('worker started')
  await tick()
  const interval = setInterval(tick, 30_000)
  const shutdown = async () => {
    if (shuttingDown) return
    shuttingDown = true
    clearInterval(interval)
    logger.info('worker shutting down')
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  logger.error({ err }, 'worker fatal error')
  process.exit(1)
})
