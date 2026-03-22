import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import prisma from '../../../../lib/db/prisma'
import logger from '../../../../lib/logger'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const { referenceId } = req.query
    const sections = await prisma.section.findMany({
      where: typeof referenceId === 'string' ? { referenceId } : undefined,
      include: { reference: { select: { id: true, filePath: true, sourceUrl: true, title: true, version: true } } },
      orderBy: { createdAt: 'asc' }
    })
    return res.status(200).json({ sections })
  } catch (e: unknown) {
    logger.error({ err: e }, 'sections queue query failed')
    return res.status(500).json({ error: 'server error' })
  }
}

export default withAdminAuth(handler)
