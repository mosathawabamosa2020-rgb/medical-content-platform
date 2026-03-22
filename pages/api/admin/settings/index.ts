import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import { loadSettings, saveSettings } from '../../../../lib/settingsStore'
import { writeAuditEvent } from '../../../../lib/auditTrail'

const updateSchema = z.object({
  general: z
    .object({
      platformName: z.string().trim().min(2).max(120).optional(),
      defaultLanguage: z.enum(['ar', 'en']).optional(),
    })
    .optional(),
  processing: z
    .object({
      retrievalTopKDefault: z.number().int().min(1).max(50).optional(),
      retrievalProbeDefault: z.number().int().min(1).max(200).optional(),
    })
    .optional(),
  ai: z
    .object({
      openSourceMode: z.boolean().optional(),
      providerHint: z.string().trim().min(2).max(120).optional(),
    })
    .optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  if (req.method === 'GET') {
    return res.status(200).json(loadSettings())
  }

  if (req.method === 'PATCH') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid payload', details: parsed.error.flatten() })
    const updated = saveSettings(parsed.data)
    writeAuditEvent({
      event: 'settings.updated',
      actorId: String(session?.user?.id || ''),
      entityType: 'settings',
      entityId: 'platform',
      payload: parsed.data as any,
    })
    return res.status(200).json(updated)
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
