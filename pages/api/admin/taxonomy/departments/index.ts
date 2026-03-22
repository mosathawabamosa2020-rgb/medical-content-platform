import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../../lib/middleware/withAdminAuth'
import { writeAuditEvent } from '../../../../../lib/auditTrail'

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  if (req.method === 'GET') {
    const state = String(req.query.state || 'all').toLowerCase()
    const where =
      state === 'active'
        ? { isActive: true }
        : state === 'inactive'
        ? { isActive: false }
        : {}
    const items = await prisma.department.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { devices: true } } },
    })
    return res.status(200).json({ items })
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })
    try {
      const created = await prisma.department.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
        },
      })
      writeAuditEvent({
        event: 'taxonomy.department.created',
        actorId: String(session?.user?.id || ''),
        entityType: 'department',
        entityId: created.id,
        payload: { name: created.name },
      })
      return res.status(201).json(created)
    } catch (err: any) {
      if (String(err?.code || '') === 'P2002') return res.status(409).json({ error: 'department name already exists' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
