import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deviceId } = req.query
  if (req.method !== 'GET') return res.status(405).end()
  if (typeof deviceId !== 'string') return res.status(400).json({ error: 'Invalid id' })
  try {
    // try to load structured sections first
    const sections = await prisma.section.findMany({ where: { deviceId }, orderBy: { order: 'asc' } })
    if (sections && sections.length) {
      const profile: Record<string, any> = {}
      for (const s of sections) {
        profile[s.title] = { content: s.content }
      }
      return res.status(200).json({ deviceId, profile })
    }

    // fallback to old KnowledgeChunk grouping
    const chunks = await prisma.knowledgeChunk.findMany({
      where: { reference: { deviceId } },
      select: { id: true, content: true, category: true, pageNumber: true }
    })
    const profile: Record<string, Array<any>> = {}
    for (const c of chunks) {
      const key = c.category || 'uncategorized'
      if (!profile[key]) profile[key] = []
      profile[key]!.push(c)
    }
    return res.status(200).json({ deviceId, profile })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  } finally {
    await prisma.$disconnect()
  }
}
