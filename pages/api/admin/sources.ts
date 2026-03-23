import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../lib/middleware/withAdminAuth'
import prisma from '../../../lib/db/prisma'
import logger from '../../../lib/logger'
import { getSourceRateLimitInfo } from '../../../lib/sources/source-runtime'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const items = await prisma.sourceRegistry.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json({
      rateLimitInfo: getSourceRateLimitInfo(),
      items: items.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        lastFetchedAt: s.lastFetchedAt ? s.lastFetchedAt.toISOString() : null,
      })),
    })
  }

  if (req.method === 'POST') {
    const { name, baseUrl, rateLimitPolicy } = req.body as {
      name?: string
      baseUrl?: string
      rateLimitPolicy?: string
    }
    if (!name || !baseUrl || !rateLimitPolicy) return res.status(400).json({ error: 'missing fields' })
    try {
      const item = await prisma.sourceRegistry.create({
        data: { name: name.trim(), baseUrl: baseUrl.trim(), rateLimitPolicy: rateLimitPolicy.trim(), active: true },
      })
      return res.status(201).json(item)
    } catch (err: unknown) {
      logger.error({ err }, 'source registry create failed')
      return res.status(500).json({ error: 'source registration failed' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)

