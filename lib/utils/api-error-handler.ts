import type { NextApiResponse } from 'next'
import logger from '../logger'

export class AppError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode = 500, code = 'internal_error') {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }
}

export function handleApiError(res: NextApiResponse, err: unknown) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code })
  }
  logger.error({ err }, 'unhandled api error')
  return res.status(500).json({ error: 'internal_server_error', code: 'internal_error' })
}

