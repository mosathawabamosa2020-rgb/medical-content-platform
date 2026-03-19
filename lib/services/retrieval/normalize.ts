import { RETRIEVAL_POLICY } from './policy'
import type { NormalizedRetrievalRequest, RetrievalRequestInput } from './types'

export function clampTopK(topK?: number) {
  const requested = Number.isFinite(topK as number) ? Number(topK) : RETRIEVAL_POLICY.DEFAULT_TOP_K
  return Math.max(1, Math.min(RETRIEVAL_POLICY.MAX_TOP_K, Math.trunc(requested)))
}

function normalizeArabic(text: string) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // tashkeel
    .replace(/[\u0625\u0623\u0622\u0671]/g, '\u0627') // alef variants -> alef
    .replace(/\u0649/g, '\u064A') // alif maqsura -> ya
    .replace(/\u0629/g, '\u0647') // taa marbuta -> ha
}

function removeControlChars(text: string) {
  return text.replace(/[\u0000-\u001F\u007F]/g, ' ')
}

const STOPWORDS = new Set([
  'the', 'of', 'for', 'to', 'in', 'on', 'with', 'and', 'or',
  'من', 'في', 'على', 'الى', 'إلى', 'عن', 'و', 'او', 'أو', 'التي', 'الذي',
])

export function normalizeQuery(raw: string) {
  const cleaned = removeControlChars(raw || '').toLowerCase()
  const normalizedArabic = normalizeArabic(cleaned)
  const tokens = normalizedArabic
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t))
    .slice(0, 64)

  return tokens.join(' ').trim().slice(0, 1000)
}

export function buildQueryCacheKey(query: string, topK: number, page: number, deviceId?: string) {
  return `q=${query}|k=${topK}|p=${page}|d=${deviceId || 'all'}`
}

export function normalizeRequest(input: RetrievalRequestInput): NormalizedRetrievalRequest {
  const query = normalizeQuery(input.query || '')
  const page = Number.isFinite(input.page as number) ? Math.max(1, Math.trunc(Number(input.page))) : 1
  return {
    query,
    deviceId: input.deviceId,
    topK: clampTopK(input.topK),
    page,
    minScore: RETRIEVAL_POLICY.DEFAULT_MIN_SCORE,
  }
}
