import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../../../lib/prisma'
import { withAdminAuth } from '../../../../../lib/adminAuth'
import { writeAuditEvent } from '../../../../../lib/auditTrail'

const createSchema = z.object({
  deviceId: z.string().trim().min(1),
  manufacturerId: z.string().trim().min(1).optional().nullable(),
  modelName: z.string().trim().min(1).max(180),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  specifications: z.string().trim().max(8000).optional().nullable(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  if (req.method === 'GET') {
    const deviceId = String(req.query.deviceId || '').trim()
    const state = String(req.query.state || 'all').toLowerCase()
    const where = {
      ...(deviceId ? { deviceId } : {}),
      ...(state === 'active' ? { isActive: true } : {}),
      ...(state === 'inactive' ? { isActive: false } : {}),
    }
    const items = await prisma.deviceModel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        device: { select: { id: true, name: true, model: true } },
        manufacturer: { select: { id: true, name: true } },
      },
    })
    return res.status(200).json({ items })
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })

    const device = await prisma.device.findUnique({ where: { id: parsed.data.deviceId }, select: { id: true } })
    if (!device) return res.status(400).json({ error: 'invalid deviceId' })

    try {
      const created = await prisma.deviceModel.create({
        data: {
          deviceId: parsed.data.deviceId,
          manufacturerId: parsed.data.manufacturerId || null,
          modelName: parsed.data.modelName,
          year: parsed.data.year ?? null,
          specifications: parsed.data.specifications ?? null,
        },
      })
      writeAuditEvent({
        event: 'taxonomy.model.created',
        actorId: String(session?.user?.id || ''),
        entityType: 'deviceModel',
        entityId: created.id,
        payload: { deviceId: created.deviceId, modelName: created.modelName },
      })
      return res.status(201).json(created)
    } catch (err: any) {
      if (String(err?.code || '') === 'P2002') return res.status(409).json({ error: 'model already exists for this device' })
      return res.status(500).json({ error: 'server error' })
    }
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
