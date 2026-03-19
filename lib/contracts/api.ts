export interface RetrievalQueryInput {
  query: string
  deviceId?: string
  topK?: number
  page?: number
  cursor?: string
}

export interface RetrievalResult {
  id: string // section id
  score: number
  snippet: string
  sectionMatch: string
  source: 'semantic' | 'keyword_fallback'
  reference: {
    id: string
    title: string | null
    sourceUrl: string | null
    deviceId: string
    uploadedAt: string | null
  }
}

export interface RetrievalQueryResponse {
  results: RetrievalResult[]
  meta: {
    topK: number
    page: number
    hasMore: boolean
    candidates: number
    fallbackUsed: boolean
    probeUsed?: number
    normalizationMs?: number
    embeddingMs?: number
    dbVectorMs?: number
    hydrationMs?: number
    rankingMs?: number
    serializationMs?: number
    totalMs?: number
    durationMs: number
  }
}

export interface VerificationDecisionPayload {
  decision: 'approved' | 'rejected'
  comment?: string
}

export interface ReferenceDetailResponse {
  id: string
  deviceId: string
  title: string
  filePath: string | null
  sourceUrl: string | null
  sourceName: string | null
  sourceId: string | null
  sourceReliabilityScore: number | null
  parsedText: string | null
  pageCount: number | null
  status:
    | 'pending_ingestion'
    | 'processing'
    | 'processed'
    | 'pending_review'
    | 'verified'
    | 'rejected'
    | 'archived'
  uploadedAt: string
  version: number
  processingDate: string | null
}

export interface PendingReviewListResponse {
  items: ReferenceDetailResponse[]
}

export interface GenerateContentInput {
  topic: string
  tone: string
  platform: 'facebook' | 'instagram' | 'x'
  contentType?: 'generic' | 'scientific_device'
  includeReel?: boolean
  referenceIds?: string[]
}

export interface GeneratedContentResponse {
  id: string
  contentType: string
  topic: string
  tone: string
  platform: string
  script: string
  caption: string
  hashtags: string[]
  voiceoverText: string
  imageSourceUrl: string | null
  imagePrompt: string | null
  topKUsed: number
  probeUsed: number
  reelTimestampBreakdown?: Array<{ at: string; text: string }>
  citationTrace?: Array<{ paragraph: string; referenceIds: string[] }>
  generationCostEstimate: number
  tokenUsageInput: number
  tokenUsageOutput: number
  generationLatencyMs: number
  retrievalLatencyMs: number
}
