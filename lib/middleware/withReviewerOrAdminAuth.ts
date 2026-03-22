import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../pages/api/auth/[...nextauth]'
import { csrfProtection } from './csrf'
import { rateLimiter } from './rateLimiter'

type NextHandler = (req: NextApiRequest, res: NextApiResponse, session?: any) => Promise<any> | any

export function withReviewerOrAdminAuth(handler: NextHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const rateAllowed = await rateLimiter(req, res, 'reviewer-admin')
    if (!rateAllowed) return
    const csrfAllowed = await csrfProtection(req, res)
    if (!csrfAllowed) return
    const session = (await getServerSession(req, res, authOptions as any)) as any
    const role = String(session?.user?.role || '').toLowerCase()
    if (!session || !['admin', 'reviewer'].includes(role)) {
      return res.status(403).json({ error: 'forbidden' })
    }
    return handler(req, res, session)
  }
}
