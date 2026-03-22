import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../../lib/middleware/withAdminAuth'
import { writeAuditEvent } from '../../../../../lib/auditTrail'

const updateSchema = z.object({
  manufacturerId: z.string().trim().min(1).nullable().optional(),
  modelName: z.string().trim().min(1).max(180).optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  specifications: z.string().trim().max(8000).nullable().optional(),
  isActive: z.boolean().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method === 'GET') {
    const item = await prisma.deviceModel.findUnique({
      where: { id: String(id) },
      include: {
        device: { select: { id: true, name: true, model: true } },
        manufacturer: { select: { id: true, name: true } },
      },
    })
    if (!item) return res.status(404).json({ error: 'not found' })
    return res.status(200).json(item)
  }

  if (req.method === 'PATCH') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })
    try {
      const updated = await prisma.deviceModel.update({
        where: { id: String(id) },
        data: {
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'manufacturerId') ? { manufacturerId: parsed.data.manufacturerId || null } : {}),
          ...(parsed.data.modelName ? { modelName: parsed.data.modelName } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'year') ? { year: parsed.data.year ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'specifications') ? { specifications: parsed.data.specifications ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'isActive') ? { isActive: parsed.data.isActive } : {}),
          ...(parsed.data.isActive === false ? { archivedAt: new Date() } : {}),
          ...(parsed.data.isActive === true ? { archivedAt: null } : {}),
        },
      })
      writeAuditEvent({
        event: 'taxonomy.model.updated',
        actorId: String(session?.user?.id || ''),
        entityType: 'deviceModel',
        entityId: updated.id,
        payload: parsed.data as any,
      })
      return res.status(200).json(updated)
    } catch (err: any) {
      if (String(err?.code || '') === 'P2025') return res.status(404).json({ error: 'not found' })
      if (String(err?.code || '') === 'P2002') return res.status(409).json({ error: 'model already exists for this device' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.deviceModel.update({
        where: { id: String(id) },
        data: { isActive: false, archivedAt: new Date() },
      })
      writeAuditEvent({
        event: 'taxonomy.model.archived',
        actorId: String(session?.user?.id || ''),
        entityType: 'deviceModel',
        entityId: String(id),
      })
      return res.status(200).json({ ok: true })
    } catch (err: any) {
      if (String(err?.code || '') === 'P2025') return res.status(404).json({ error: 'not found' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
