import type { NextApiRequest, NextApiResponse } from 'next'
import { enforceCsrfForMutation } from '../apiSecurity'

export async function csrfProtection(req: NextApiRequest, res: NextApiResponse) {
  return enforceCsrfForMutation(req, res)
}

