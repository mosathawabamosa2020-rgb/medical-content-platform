type QueueDepthSnapshot = {
  queue_depth_pdf: number
  queue_depth_embed: number
  queue_depth_search: number
}

type RetrievalLatencySnapshot = {
  retrieval_latency_ms_p50: number
  retrieval_latency_ms_p95: number
}

type ApiErrorRateSnapshot = {
  api_error_rate: number
}

const MAX_SAMPLES = 500
const RETRIEVAL_LATENCIES_MS: number[] = []
let embeddingFallbackActivatedTotal = 0
let apiErrorRate = 0

function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1))
  const value = sorted[index] ?? 0
  return Number(value.toFixed(3))
}

export function recordRetrievalLatencyMs(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return
  RETRIEVAL_LATENCIES_MS.push(durationMs)
  if (RETRIEVAL_LATENCIES_MS.length > MAX_SAMPLES) RETRIEVAL_LATENCIES_MS.shift()
}

export function incrementEmbeddingFallbackActivated() {
  embeddingFallbackActivatedTotal += 1
}

export function getRetrievalLatencySnapshot(): RetrievalLatencySnapshot {
  return {
    retrieval_latency_ms_p50: percentile(RETRIEVAL_LATENCIES_MS, 50),
    retrieval_latency_ms_p95: percentile(RETRIEVAL_LATENCIES_MS, 95),
  }
}

export function getEmbeddingFallbackActivatedTotal(): number {
  return embeddingFallbackActivatedTotal
}

export function setApiErrorRate(rate: number) {
  if (!Number.isFinite(rate) || rate < 0) return
  apiErrorRate = Number(rate.toFixed(4))
}

export function getApiErrorRate(): number {
  return apiErrorRate
}

async function computeDepth(queueName: string): Promise<number> {
  try {
    const bullmq = require('bullmq')
    const { Queue } = bullmq
    const queue = new Queue(queueName, {
      connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    })
    const counts = await Promise.race([
      queue.getJobCounts('waiting', 'active', 'delayed', 'paused'),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)),
    ])
    await queue.close().catch(() => {})
    if (!counts) return 0
    const typed = counts as Record<string, number | undefined>
    return Number(typed.waiting || 0) + Number(typed.active || 0) + Number(typed.delayed || 0) + Number(typed.paused || 0)
  } catch {
    return 0
  }
}

export async function getQueueDepthSnapshot(): Promise<QueueDepthSnapshot> {
  const [pdf, embed, search] = await Promise.all([
    computeDepth('pdf-processing'),
    computeDepth('embedding-generation'),
    computeDepth('source-search'),
  ])
  return {
    queue_depth_pdf: pdf,
    queue_depth_embed: embed,
    queue_depth_search: search,
  }
}

export function buildPrometheusMetricsText(input: QueueDepthSnapshot & RetrievalLatencySnapshot & ApiErrorRateSnapshot & {
  embedding_fallback_activated_total: number
}) {
  return [
    '# HELP queue_depth_pdf Number of jobs pending/active in pdf-processing queue.',
    '# TYPE queue_depth_pdf gauge',
    `queue_depth_pdf ${input.queue_depth_pdf}`,
    '# HELP queue_depth_embed Number of jobs pending/active in embedding-generation queue.',
    '# TYPE queue_depth_embed gauge',
    `queue_depth_embed ${input.queue_depth_embed}`,
    '# HELP queue_depth_search Number of jobs pending/active in source-search queue.',
    '# TYPE queue_depth_search gauge',
    `queue_depth_search ${input.queue_depth_search}`,
    '# HELP retrieval_latency_ms_p50 Rolling retrieval latency P50 in milliseconds.',
    '# TYPE retrieval_latency_ms_p50 gauge',
    `retrieval_latency_ms_p50 ${input.retrieval_latency_ms_p50}`,
    '# HELP retrieval_latency_ms_p95 Rolling retrieval latency P95 in milliseconds.',
    '# TYPE retrieval_latency_ms_p95 gauge',
    `retrieval_latency_ms_p95 ${input.retrieval_latency_ms_p95}`,
    '# HELP api_error_rate Rolling API error rate (0.0 - 1.0).',
    '# TYPE api_error_rate gauge',
    `api_error_rate ${input.api_error_rate}`,
    '# HELP embedding_fallback_activated_total Count of embedding fallback activations.',
    '# TYPE embedding_fallback_activated_total counter',
    `embedding_fallback_activated_total ${input.embedding_fallback_activated_total}`,
  ].join('\n')
}

export function __resetMetricsForTests() {
  RETRIEVAL_LATENCIES_MS.length = 0
  embeddingFallbackActivatedTotal = 0
  apiErrorRate = 0
}
