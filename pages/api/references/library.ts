import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { Prisma } from '@prisma/client'

// public endpoint to browse verified references with simple pagination
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { page = '1', limit = '20', category, featured, recent } = req.query as Record<string, string>
  const p = parseInt(page, 10)
  const l = parseInt(limit, 10)
  if (isNaN(p) || p < 1 || isNaN(l) || l < 1 || l > 50) {
    return res.status(400).json({ error: 'invalid pagination' })
  }
  const skip = (p - 1) * l
  const filter: Prisma.ReferenceWhereInput = {
    status: 'verified',
    sections: { some: {} },
    ...(category ? { sourceName: category } : {}),
  }
  const orderBy: Prisma.ReferenceOrderByWithRelationInput =
    featured === 'true'
      ? { sourceReliabilityScore: 'desc' }
      : recent === 'true'
        ? { processingDate: 'desc' }
        : { uploadedAt: 'desc' }
  const [items, total] = await Promise.all([
    prisma.reference.findMany({
      where: filter,
      orderBy,
      skip,
      take: l
    }),
    prisma.reference.count({ where: filter })
  ])
  res.status(200).json({ items, total, page: p, limit: l })
}
