import logger from '../logger'
import worker from '../workers/ingestionWorker'

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000
let inProcessScheduler: NodeJS.Timeout | null = null
let initialized = false

function getBullMq() {
  try {
    // Optional dependency in open-source default mode.
    return require('bullmq')
  } catch {
    return null
  }
}

function getRedisConnection() {
  return { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } }
}

async function enqueueWithBullMq(
  queueName: string,
  jobName: string,
  data: Record<string, unknown>,
  opts?: Record<string, unknown>
) {
  const bullmq = getBullMq()
  if (!bullmq) return null
  const { Queue } = bullmq
  const queue = new Queue(queueName, getRedisConnection())
  return queue.add(jobName, data, opts || {})
}

export async function enqueueIngestionJob(reason: string) {
  const queued = await enqueueWithBullMq('ingestion', 'device_reference_search', { reason, ts: Date.now() })
  if (queued) return { mode: 'bullmq', id: queued.id || null }
  await worker.runIngestionWorker()
  return { mode: 'inline', id: null }
}

async function registerRecurringBullMqJobs() {
  const bullmq = getBullMq()
  if (!bullmq) return false
  const { Queue } = bullmq
  const queue = new Queue('ingestion', getRedisConnection())
  await queue.add(
    'device_reference_search',
    { reason: 'recurring', ts: Date.now() },
    { repeat: { every: FORTY_EIGHT_HOURS_MS }, removeOnComplete: true, removeOnFail: 10 }
  )
  await queue.add(
    'source_discovery',
    { reason: 'recurring', ts: Date.now() },
    { repeat: { every: FORTY_EIGHT_HOURS_MS }, removeOnComplete: true, removeOnFail: 10 }
  )
  await queue.add(
    're_indexing',
    { reason: 'recurring', ts: Date.now() },
    { repeat: { every: FORTY_EIGHT_HOURS_MS }, removeOnComplete: true, removeOnFail: 10 }
  )
  return true
}

function startFallbackScheduler() {
  if (inProcessScheduler) return
  inProcessScheduler = setInterval(async () => {
    try {
      await worker.runIngestionWorker()
    } catch (err) {
      logger.error({ err }, 'fallback scheduler ingestion run failed')
    }
  }, FORTY_EIGHT_HOURS_MS)
}

export async function ensureSchedulersStarted() {
  if (initialized) return
  initialized = true
  const configuredBullMq = await registerRecurringBullMqJobs()
  if (!configuredBullMq) {
    startFallbackScheduler()
    logger.warn('BullMQ unavailable, using in-process 48h scheduler fallback')
  }
}
