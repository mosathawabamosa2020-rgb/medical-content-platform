import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })

  const ref = await prisma.reference.findFirst({
    where: { id: String(id), status: 'verified' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, content: true, order: true, createdAt: true },
      },
    },
  })
  if (!ref) return res.status(404).json({ error: 'not found' })

  return res.status(200).json({
    id: ref.id,
    title: ref.title,
    sourceName: ref.sourceName,
    sourceUrl: ref.sourceUrl,
    uploadedAt: ref.uploadedAt.toISOString(),
    processingDate: ref.processingDate ? ref.processingDate.toISOString() : null,
    verificationBadge: 'verified',
    sections: ref.sections.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      order: s.order,
      createdAt: s.createdAt.toISOString(),
    })),
  })
}
