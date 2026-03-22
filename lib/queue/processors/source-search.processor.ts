import prisma from '../../db/prisma'
import { scoreReference } from '../../utils/quality-scorer'

export async function processSourceSearchJob(deviceId: string, query: string, sourceName: string) {
  const qualityScore = scoreReference({
    isPeerReviewed: false,
    publisherTier: 'unknown',
    publicationYear: new Date().getUTCFullYear(),
    hasDoi: false,
  })

  await prisma.sourceRegistry.upsert({
    where: { name: sourceName },
    create: {
      name: sourceName,
      baseUrl: query,
      rateLimitPolicy: `quality-score:${qualityScore}`,
      active: true,
    },
    update: {
      baseUrl: query,
      rateLimitPolicy: `quality-score:${qualityScore}`,
      lastFetchedAt: new Date(),
      active: true,
    },
  })

  return { deviceId, query, qualityScore }
}


