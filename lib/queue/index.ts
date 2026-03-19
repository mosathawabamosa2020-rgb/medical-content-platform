import { Queue } from 'bullmq'

export type PdfJobData = {
  referenceId: string
  filePath: string
}

export type EmbedJobData = {
  chunkId: string
  text: string
}

export type SourceSearchJobData = {
  deviceId: string
  query: string
}

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  maxRetriesPerRequest: null,
}

export const pdfProcessingQueue = new Queue<PdfJobData>('pdf-processing', { connection })
export const embeddingGenerationQueue = new Queue<EmbedJobData>('embedding-generation', { connection })
export const sourceSearchQueue = new Queue<SourceSearchJobData>('source-search', { connection })

export { connection as queueConnection }
