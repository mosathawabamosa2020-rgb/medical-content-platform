import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../../lib/middleware/withAdminAuth'
import { writeAuditEvent } from '../../../../../lib/auditTrail'

const createSchema = z.object({
  name: z.string().trim().min(2).max(180),
  model: z.string().trim().min(1).max(180),
  description: z.string().trim().max(2000).optional(),
  departmentId: z.string().trim().min(1),
  manufacturerId: z.string().trim().min(1).optional().nullable(),
  knowledgeComplete: z.boolean().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  if (req.method === 'GET') {
    const departmentId = String(req.query.departmentId || '').trim()
    const state = String(req.query.state || 'all').toLowerCase()
    const lifecycleFilter =
      state === 'active'
        ? { isActive: true }
        : state === 'inactive'
        ? { isActive: false }
        : {}
    const items = await prisma.device.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...lifecycleFilter,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, name: true } },
        deviceModels: { select: { id: true, modelName: true, year: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    return res.status(200).json({ items })
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })

    const dep = await prisma.department.findUnique({ where: { id: parsed.data.departmentId }, select: { id: true } })
    if (!dep) return res.status(400).json({ error: 'invalid departmentId' })

    try {
      const created = await prisma.device.create({
        data: {
          name: parsed.data.name,
          model: parsed.data.model,
          description: parsed.data.description || null,
          departmentId: parsed.data.departmentId,
          manufacturerId: parsed.data.manufacturerId || null,
          knowledgeComplete: parsed.data.knowledgeComplete ?? false,
        },
      })
      writeAuditEvent({
        event: 'taxonomy.device.created',
        actorId: String(session?.user?.id || ''),
        entityType: 'device',
        entityId: created.id,
        payload: { name: created.name, model: created.model, departmentId: created.departmentId },
      })
      return res.status(201).json(created)
    } catch (err: any) {
      if (String(err?.code || '') === 'P2002') return res.status(409).json({ error: 'device name/model already exists' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
