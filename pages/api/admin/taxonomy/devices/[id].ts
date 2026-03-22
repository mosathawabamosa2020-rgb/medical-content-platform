import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../../lib/middleware/withAdminAuth'
import { writeAuditEvent } from '../../../../../lib/auditTrail'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(180).optional(),
  model: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  departmentId: z.string().trim().min(1).optional(),
  manufacturerId: z.string().trim().min(1).nullable().optional(),
  knowledgeComplete: z.boolean().optional(),
  knowledgeScore: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method === 'GET') {
    const item = await prisma.device.findUnique({
      where: { id: String(id) },
      include: {
        department: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, name: true } },
        deviceModels: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!item) return res.status(404).json({ error: 'not found' })
    return res.status(200).json(item)
  }

  if (req.method === 'PATCH') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })

    if (parsed.data.departmentId) {
      const dep = await prisma.department.findUnique({ where: { id: parsed.data.departmentId }, select: { id: true } })
      if (!dep) return res.status(400).json({ error: 'invalid departmentId' })
    }

    try {
      if (parsed.data.isActive === false) {
        const activeModels = await prisma.deviceModel.count({
          where: { deviceId: String(id), isActive: true },
        })
        if (activeModels > 0) {
          return res.status(409).json({
            error: 'cannot deactivate device with active models',
            activeModels,
          })
        }
      }
      const updated = await prisma.device.update({
        where: { id: String(id) },
        data: {
          ...(parsed.data.name ? { name: parsed.data.name } : {}),
          ...(parsed.data.model ? { model: parsed.data.model } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'description') ? { description: parsed.data.description ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'departmentId') ? { departmentId: parsed.data.departmentId } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'manufacturerId') ? { manufacturerId: parsed.data.manufacturerId || null } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'knowledgeComplete') ? { knowledgeComplete: parsed.data.knowledgeComplete } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'knowledgeScore') ? { knowledgeScore: parsed.data.knowledgeScore } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'isActive') ? { isActive: parsed.data.isActive } : {}),
          ...(parsed.data.isActive === false ? { archivedAt: new Date() } : {}),
          ...(parsed.data.isActive === true ? { archivedAt: null } : {}),
        },
      })
      writeAuditEvent({
        event: 'taxonomy.device.updated',
        actorId: String(session?.user?.id || ''),
        entityType: 'device',
        entityId: updated.id,
        payload: parsed.data as any,
      })
      return res.status(200).json(updated)
    } catch (err: any) {
      if (String(err?.code || '') === 'P2025') return res.status(404).json({ error: 'not found' })
      if (String(err?.code || '') === 'P2002') return res.status(409).json({ error: 'device name/model already exists' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const activeModels = await prisma.deviceModel.count({
        where: { deviceId: String(id), isActive: true },
      })
      if (activeModels > 0) {
        return res.status(409).json({
          error: 'cannot archive device with active models',
          activeModels,
        })
      }
      await prisma.device.update({
        where: { id: String(id) },
        data: { isActive: false, archivedAt: new Date() },
      })
      writeAuditEvent({
        event: 'taxonomy.device.archived',
        actorId: String(session?.user?.id || ''),
        entityType: 'device',
        entityId: String(id),
      })
      return res.status(200).json({ ok: true })
    } catch (err: any) {
      if (String(err?.code || '') === 'P2025') return res.status(404).json({ error: 'not found' })
      return res.status(409).json({ error: 'cannot delete device with linked records' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
