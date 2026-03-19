import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from './auth'
import { enforceCsrfForMutation, enforceRateLimit, setSecurityHeaders } from './apiSecurity'

export type NextHandler = (req: NextApiRequest, res: NextApiResponse, session?: any) => Promise<any> | any

export function withRoleAuth(handler: NextHandler, allowedRoles: string[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    setSecurityHeaders(res)
    if (!enforceRateLimit(req, res, 'admin', 60_000, 120)) return
    if (!enforceCsrfForMutation(req, res)) return
    const session = (await getServerSession(req, res, authOptions as any)) as any
    if (!session || !allowedRoles.includes(String(session.user?.role || ''))) {
      return res.status(403).json({ error: 'forbidden' })
    }
    // pass session through in case handler needs it
    return handler(req, res, session)
  }
}

export function withAdminAuth(handler: NextHandler) {
  return withRoleAuth(handler, ['admin'])
}

export function withReviewerOrAdminAuth(handler: NextHandler) {
  return withRoleAuth(handler, ['admin', 'reviewer'])
}
