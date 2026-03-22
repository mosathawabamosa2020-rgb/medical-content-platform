import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../../lib/middleware/withAdminAuth'
import { writeAuditEvent } from '../../../../../lib/auditTrail'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method === 'GET') {
    const item = await prisma.department.findUnique({
      where: { id: String(id) },
      include: { devices: { select: { id: true, name: true, model: true } } },
    })
    if (!item) return res.status(404).json({ error: 'not found' })
    return res.status(200).json(item)
  }

  if (req.method === 'PATCH') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })
    try {
      if (parsed.data.isActive === false) {
        const activeChildren = await prisma.device.count({
          where: { departmentId: String(id), isActive: true },
        })
        if (activeChildren > 0) {
          return res.status(409).json({
            error: 'cannot deactivate department with active devices',
            activeDevices: activeChildren,
          })
        }
      }
      const updated = await prisma.department.update({
        where: { id: String(id) },
        data: {
          ...(parsed.data.name ? { name: parsed.data.name } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'description') ? { description: parsed.data.description ?? null } : {}),
          ...(Object.prototype.hasOwnProperty.call(parsed.data, 'isActive') ? { isActive: parsed.data.isActive } : {}),
          ...(parsed.data.isActive === false ? { archivedAt: new Date() } : {}),
          ...(parsed.data.isActive === true ? { archivedAt: null } : {}),
        },
      })
      writeAuditEvent({
        event: 'taxonomy.department.updated',
        actorId: String(session?.user?.id || ''),
        entityType: 'department',
        entityId: updated.id,
        payload: parsed.data as any,
      })
      return res.status(200).json(updated)
    } catch (err: any) {
      if (String(err?.code || '') === 'P2025') return res.status(404).json({ error: 'not found' })
      if (String(err?.code || '') === 'P2002') return res.status(409).json({ error: 'department name already exists' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const activeChildren = await prisma.device.count({
        where: { departmentId: String(id), isActive: true },
      })
      if (activeChildren > 0) {
        return res.status(409).json({
          error: 'cannot archive department with active devices',
          activeDevices: activeChildren,
        })
      }
      await prisma.department.update({
        where: { id: String(id) },
        data: { isActive: false, archivedAt: new Date() },
      })
      writeAuditEvent({
        event: 'taxonomy.department.archived',
        actorId: String(session?.user?.id || ''),
        entityType: 'department',
        entityId: String(id),
      })
      return res.status(200).json({ ok: true })
    } catch (err: any) {
      if (String(err?.code || '') === 'P2025') return res.status(404).json({ error: 'not found' })
      return res.status(409).json({ error: 'cannot delete department with linked records' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
