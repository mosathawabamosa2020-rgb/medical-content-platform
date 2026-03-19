import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, ReferenceStatus } from '@prisma/client'
import { withAdminAuth } from '../../../lib/adminAuth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const ingestedCount = await prisma.reference.count({ where: { status: ReferenceStatus.pending_ingestion } })
    const verificationCount = await prisma.reference.count({ where: { status: ReferenceStatus.pending_review } })
    const knowledgeLibraryCount = await prisma.reference.count({ where: { status: ReferenceStatus.verified } })
    return res.status(200).json({ ingestedCount, verificationCount, knowledgeLibraryCount })
  } catch (e: unknown) {
    console.error(e)
    return res.status(500).json({ error: 'server error' })
  } finally {
    await prisma.$disconnect()
  }
}

export default withAdminAuth(handler)
