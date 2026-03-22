import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db/prisma'

type DeviceDto = {
  id: string
  name: string
  model: string
  description: string | null
  createdAt: string
  references: Array<{ id: string; status: string }>
  department: string | null
  models: string[]
  knowledgeStatus: 'complete' | 'in_progress'
}

function parsePositiveInt(value: string | undefined, fallback: number, max: number) {
  const n = Number(value ?? fallback)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(Math.floor(n), max)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const page = parsePositiveInt(req.query.page as string | undefined, 1, 10_000)
  const limit = parsePositiveInt(req.query.limit as string | undefined, 20, 100)
  const q = String(req.query.q || '').trim()
  const department = String(req.query.department || '').trim()
  const knowledgeStatus = String(req.query.knowledgeStatus || '').trim().toLowerCase()

  if (knowledgeStatus && !['complete', 'in_progress'].includes(knowledgeStatus)) {
    return res.status(400).json({ error: 'invalid knowledgeStatus filter' })
  }

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { model: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const skip = (page - 1) * limit

  const [rows, total] = await Promise.all([
    prisma.device.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        references: {
          select: { id: true, status: true },
        },
      },
    }),
    prisma.device.count({ where }),
  ])

  const items: DeviceDto[] = rows
    .map((d) => {
      const verifiedCount = d.references.filter((r) => r.status === 'verified').length
      const status: DeviceDto['knowledgeStatus'] = verifiedCount >= 3 ? 'complete' : 'in_progress'
      return {
        id: d.id,
        name: d.name,
        model: d.model,
        description: d.description || null,
        createdAt: d.createdAt ? new Date(d.createdAt as unknown as string | Date).toISOString() : new Date(0).toISOString(),
        references: (d.references || []).map((r) => ({ id: r.id, status: String(r.status) })),
        department: null,
        models: d.model ? [d.model] : [],
        knowledgeStatus: status,
      }
    })
    .filter((d) => (knowledgeStatus ? d.knowledgeStatus === knowledgeStatus : true))
    .filter((d) => (department ? String(d.department || '').toLowerCase() === department.toLowerCase() : true))

  return res.status(200).json({
    // Canonical list key
    items,
    // Backward-compatible alias for legacy UI pages
    devices: items,
    page,
    limit,
    total,
    hasMore: skip + items.length < total,
    filters: {
      q: q || null,
      department: department || null,
      knowledgeStatus: knowledgeStatus || null,
    },
  })
}
