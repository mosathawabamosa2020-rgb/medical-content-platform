import { RETRIEVAL_POLICY } from './policy'
import type { RetrievalCandidate, RetrievalResultItem } from './types'

function isRecent(uploadedAt: Date | null) {
  if (!uploadedAt) return false
  const ageMs = Date.now() - new Date(uploadedAt).getTime()
  return ageMs <= RETRIEVAL_POLICY.RECENCY_DAYS * 24 * 60 * 60 * 1000
}

function reliabilityBoost(score: number | null) {
  if (score == null || Number.isNaN(score)) return 0
  const clamped = Math.max(0, Math.min(1, score))
  return clamped * 0.1
}

function keywordScore(text: string, query: string) {
  const qTokens = query.split(/\s+/).filter(Boolean)
  if (!qTokens.length) return 0
  const lowered = text.toLowerCase()
  let matches = 0
  for (const t of qTokens) {
    if (lowered.includes(t)) matches += 1
  }
  return matches / qTokens.length
}

export function computeFinalScore(candidate: RetrievalCandidate, normalizedQuery: string) {
  const similarity = Number(candidate.similarity || 0)
  const keyword = keywordScore(candidate.pageContent || '', normalizedQuery)
  const weightedSimilarity = similarity * RETRIEVAL_POLICY.VECTOR_WEIGHT + keyword * RETRIEVAL_POLICY.KEYWORD_WEIGHT
  const recentBoost = isRecent(candidate.uploadedAt) ? 0.05 : 0
  return weightedSimilarity + reliabilityBoost(candidate.sourceReliabilityScore) + recentBoost
}

export function rankAndPackage(
  candidates: RetrievalCandidate[],
  topK: number,
  minScore: number,
  normalizedQuery: string
): RetrievalResultItem[] {
  return candidates
    .map((c) => ({ c, score: computeFinalScore(c, normalizedQuery) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => ({
      id: x.c.id,
      score: Number(x.score.toFixed(6)),
      snippet: (x.c.pageContent || '').slice(0, 240),
      sectionMatch: x.c.title || 'Section',
      source: 'semantic',
      reference: {
        id: x.c.referenceId,
        title: x.c.title || null,
        sourceUrl: x.c.sourceUrl || null,
        deviceId: x.c.deviceId || '',
        uploadedAt: x.c.uploadedAt ? new Date(x.c.uploadedAt).toISOString() : null,
      },
    }))
}
