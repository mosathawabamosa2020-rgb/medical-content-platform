import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const counts = await prisma.reference.groupBy({
    by: ['status'],
    _count: { _all: true },
  })
  return res.json({ counts })
}

export default withAdminAuth(handler)


