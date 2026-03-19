import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import logger from '../../../lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    await prisma.$queryRaw`SELECT 1`
    return res.status(200).json({ status: 'ok' })
  } catch (err: any) {
    logger.error(err, 'database health check failed')
    return res.status(503).json({ status: 'error' })
  } finally {
    await prisma.$disconnect()
  }
}
