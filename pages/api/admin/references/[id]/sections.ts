import type { NextApiRequest, NextApiResponse } from 'next'
import { withReviewerOrAdminAuth } from '../../../../../lib/adminAuth'
import prisma from '../../../../../lib/prisma'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'invalid id' })
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const sections = await prisma.section.findMany({ where: { referenceId: String(id) }, orderBy: { order: 'asc' } })
    return res.status(200).json({ sections })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  }
}

export default withReviewerOrAdminAuth(handler)
