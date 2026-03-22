import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/db/prisma'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const tasks = await prisma.publishingTask.findMany({
    orderBy: { scheduledDate: 'asc' },
    take: 100,
  })
  return res.json({ tasks })
}

export default withAdminAuth(handler)
