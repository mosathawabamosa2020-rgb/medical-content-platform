import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
import prisma from '../../../lib/prisma'
import { enforceCsrfForMutation, setSecurityHeaders } from '../../../lib/apiSecurity'
import { writeAuditEvent } from '../../../lib/auditTrail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setSecurityHeaders(res)
  const session = (await getServerSession(req, res, authOptions as any)) as any
  if (!session?.user?.id) return res.status(401).json({ error: 'unauthorized' })
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  if (req.method === 'GET') {
    const item = await prisma.generatedContent.findFirst({
      where: { id: String(id), userId: session.user.id },
      include: { references: true, drafts: { orderBy: { createdAt: 'desc' }, take: 1 }, reelScripts: true },
    })
    if (!item) return res.status(404).json({ error: 'not found' })
    return res.status(200).json(item)
  }

  if (req.method === 'PATCH') {
    if (!enforceCsrfForMutation(req, res)) return
    const { script, caption, hashtags, voiceoverText } = req.body as {
      script?: string
      caption?: string
      hashtags?: string[]
      voiceoverText?: string
    }
    const updated = await prisma.generatedContent.updateMany({
      where: { id: String(id), userId: session.user.id },
      data: {
        ...(typeof script === 'string' ? { script: script.slice(0, 2000) } : {}),
        ...(typeof caption === 'string' ? { caption: caption.slice(0, 400) } : {}),
        ...(Array.isArray(hashtags) ? { hashtags: hashtags.slice(0, 8) } : {}),
        ...(typeof voiceoverText === 'string' ? { voiceoverText: voiceoverText.slice(0, 2000) } : {}),
      },
    })
    if (updated.count === 0) return res.status(404).json({ error: 'not found' })
    const item = await prisma.generatedContent.findUnique({ where: { id: String(id) } })
    writeAuditEvent({
      event: 'content.updated',
      actorId: String(session?.user?.id || ''),
      entityType: 'generatedContent',
      entityId: String(id),
      payload: {
        script: typeof script === 'string',
        caption: typeof caption === 'string',
        hashtags: Array.isArray(hashtags),
        voiceoverText: typeof voiceoverText === 'string',
      },
    })
    return res.status(200).json(item)
  }

  return res.status(405).end()
}
