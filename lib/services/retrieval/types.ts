import type { RetrievalQueryInput, RetrievalQueryResponse, RetrievalResult } from '../../contracts/api'

export type RetrievalSource = 'semantic' | 'keyword_fallback'

export type RetrievalRequestInput = RetrievalQueryInput

export interface NormalizedRetrievalRequest {
  query: string
  deviceId?: string
  topK: number
  page: number
  minScore: number
}

export interface RetrievalCandidate {
  id: string // section id
  referenceId: string
  pageContent: string | null
  deviceId: string | null
  similarity: number
  sourceReliabilityScore: number | null
  uploadedAt: Date | null
  sourceUrl?: string | null
  title?: string | null
}

export type RetrievalResultItem = RetrievalResult
export type RetrievalResponse = RetrievalQueryResponse

export interface RetrievalDependencies {
  embedder: (text: string) => Promise<number[]>
  prisma: any
  probe?: number
  logger?: {
    info: (obj: unknown, msg?: string) => void
    error: (obj: unknown, msg?: string) => void
  }
}
