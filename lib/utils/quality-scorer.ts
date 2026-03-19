export type PublisherTier = 'tier1' | 'tier2' | 'tier3' | 'unknown'

export type ScoringInput = {
  isPeerReviewed: boolean
  publisherTier: PublisherTier
  publicationYear?: number | null
  hasDoi: boolean
}

function scoreRecency(publicationYear?: number | null): number {
  if (!publicationYear) return 0
  const currentYear = new Date().getUTCFullYear()
  const age = Math.max(0, currentYear - publicationYear)
  if (age <= 5) return 20
  return Math.max(0, 20 - (age - 5) * 2)
}

function scorePublisherTier(tier: PublisherTier): number {
  if (tier === 'tier1') return 25
  if (tier === 'tier2') return 15
  if (tier === 'tier3') return 8
  return 0
}

export function scoreReference(input: ScoringInput): number {
  const peerReviewScore = input.isPeerReviewed ? 40 : 0
  const publisherScore = scorePublisherTier(input.publisherTier)
  const recencyScore = scoreRecency(input.publicationYear)
  const doiScore = input.hasDoi ? 15 : 0
  return Math.max(0, Math.min(100, peerReviewScore + publisherScore + recencyScore + doiScore))
}

