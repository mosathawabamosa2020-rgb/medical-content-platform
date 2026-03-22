import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { deviceId, sourceName, sourceId, title, sourceUrl, sourceReliabilityScore } = req.body
  if (!deviceId || !sourceName || !sourceId || !title) return res.status(400).json({ error: 'missing fields' })

  try {
    // duplicate guard: ensure no reference with same sourceName+sourceId exists for device
    const dup = await prisma.reference.findFirst({ where: { deviceId, sourceName, sourceId } })
    if (dup) return res.status(409).json({ error: 'duplicate', referenceId: dup.id })

    const ref = await prisma.reference.create({ data: {
      deviceId,
      title,
      sourceUrl: sourceUrl || undefined,
      sourceName,
      sourceId,
      sourceReliabilityScore: sourceReliabilityScore || 0.0,
      status: undefined
    } as any })

    // mark as pending_ingestion via processingDate=null and version increment; we use processingDate to signal
    await prisma.reference.update({ where: { id: ref.id }, data: { processingDate: null } })

    return res.status(201).json({ referenceId: ref.id })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
