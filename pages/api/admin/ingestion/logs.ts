import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '../../../../lib/adminAuth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const logs = await prisma.ingestionLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    return res.status(200).json({ logs })
  } catch (e: unknown) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  } finally {
    await prisma.$disconnect()
  }
}

export default withAdminAuth(handler)
