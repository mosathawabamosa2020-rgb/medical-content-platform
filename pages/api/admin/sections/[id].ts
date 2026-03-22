import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import prisma from '../../../../lib/db/prisma'
import logger from '../../../../lib/logger'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'invalid id' })
  try {
    if (req.method === 'GET') {
      const sec = await prisma.section.findUnique({
        where: { id },
        include: { reference: true }
      })
      if (!sec) return res.status(404).json({ error: 'not found' })
      return res.status(200).json(sec)
    }
    return res.status(405).end()
  } catch (e: unknown) {
    logger.error({ err: e, sectionId: id }, 'section endpoint failed')
    return res.status(500).json({ error: 'server error' })
  }
}

export default withAdminAuth(handler)
