import fetch, { type RequestInit, type Response } from 'node-fetch'
import { withRetry } from '../utils/retry'

export type SourceName = 'pubmed' | 'fda' | 'wikimedia' | 'open_medical_libraries' | 'openalex'

type RateLimitPolicy = {
  requestsPerSecond: number
  timeoutMs: number
  maxAttempts: number
}

const DEFAULT_POLICIES: Record<SourceName, RateLimitPolicy> = {
  pubmed: { requestsPerSecond: 3, timeoutMs: 10000, maxAttempts: 3 },
  fda: { requestsPerSecond: 2, timeoutMs: 10000, maxAttempts: 3 },
  wikimedia: { requestsPerSecond: 2, timeoutMs: 10000, maxAttempts: 3 },
  open_medical_libraries: { requestsPerSecond: 2, timeoutMs: 10000, maxAttempts: 3 },
  openalex: { requestsPerSecond: 2, timeoutMs: 12000, maxAttempts: 3 },
}

const lastRequestMsBySource = new Map<SourceName, number>()

function resolvePolicy(source: SourceName): RateLimitPolicy {
  const base = DEFAULT_POLICIES[source]
  const envPrefix = source.toUpperCase()
  const rps = Number(process.env[`${envPrefix}_RPS`] || base.requestsPerSecond)
  const timeoutMs = Number(process.env[`${envPrefix}_TIMEOUT_MS`] || base.timeoutMs)
  const maxAttempts = Number(process.env[`${envPrefix}_MAX_ATTEMPTS`] || base.maxAttempts)
  return {
    requestsPerSecond: Number.isFinite(rps) && rps > 0 ? rps : base.requestsPerSecond,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : base.timeoutMs,
    maxAttempts: Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : base.maxAttempts,
  }
}

async function applyRateLimitDelay(source: SourceName, policy: RateLimitPolicy) {
  const minGapMs = Math.ceil(1000 / policy.requestsPerSecond)
  const now = Date.now()
  const previous = lastRequestMsBySource.get(source) || 0
  const elapsed = now - previous
  if (elapsed < minGapMs) {
    await new Promise((resolve) => setTimeout(resolve, minGapMs - elapsed))
  }
  lastRequestMsBySource.set(source, Date.now())
}

export async function fetchWithSourcePolicy(source: SourceName, url: string, init?: RequestInit): Promise<Response> {
  const policy = resolvePolicy(source)
  return withRetry(
    async () => {
      await applyRateLimitDelay(source, policy)
      const response = await fetch(url, init)
      if (!response.ok && response.status >= 500) {
        throw new Error(`${source}_http_${response.status}`)
      }
      return response
    },
    { maxAttempts: policy.maxAttempts, timeoutMs: policy.timeoutMs, delayMs: 250, maxDelayMs: 3000, jitterRatio: 0.3 }
  )
}

export function appendOpenAlexPolitePool(url: string): string {
  const email = (process.env.OPENALEX_EMAIL || '').trim()
  if (!email) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}mailto=${encodeURIComponent(email)}`
}

export function getSourceRateLimitInfo() {
  return {
    openalexEmailConfigured: Boolean((process.env.OPENALEX_EMAIL || '').trim()),
    policies: {
      pubmed: resolvePolicy('pubmed'),
      fda: resolvePolicy('fda'),
      wikimedia: resolvePolicy('wikimedia'),
      openMedicalLibraries: resolvePolicy('open_medical_libraries'),
      openalex: resolvePolicy('openalex'),
    },
  }
}
