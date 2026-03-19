import type { NextApiRequest, NextApiResponse } from 'next'
import { enforceRateLimit } from '../apiSecurity'

export async function rateLimiter(req: NextApiRequest, res: NextApiResponse, scope = 'default') {
  return enforceRateLimit(req, res, scope, 60_000, 120)
}

