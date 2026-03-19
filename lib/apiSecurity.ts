import type { NextApiRequest, NextApiResponse } from 'next'

type RateBucket = { count: number; resetAt: number }

const inMemoryBuckets = new Map<string, RateBucket>()

function getClientIp(req: NextApiRequest): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0]?.trim() || 'unknown'
  }
  return req.socket.remoteAddress || 'unknown'
}

export function setSecurityHeaders(res: NextApiResponse): void {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; base-uri 'self'")
}

export function enforceCsrfForMutation(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) return true
  if (process.env.NODE_ENV === 'test') return true
  const origin = req.headers.origin
  const referer = req.headers.referer
  const host = req.headers.host
  if (!host) {
    res.status(403).json({ error: 'csrf validation failed' })
    return false
  }
  if (!origin && referer) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost === host) return true
    } catch {
      res.status(403).json({ error: 'csrf validation failed' })
      return false
    }
  }
  if (!origin) return true
  try {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      res.status(403).json({ error: 'csrf validation failed' })
      return false
    }
  } catch {
    res.status(403).json({ error: 'csrf validation failed' })
    return false
  }
  return true
}

export function enforceRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  scope: string,
  windowMs: number,
  maxRequests: number
): boolean {
  const now = Date.now()
  const key = `${scope}:${getClientIp(req)}`
  const current = inMemoryBuckets.get(key)
  if (!current || current.resetAt <= now) {
    inMemoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= maxRequests) {
    res.status(429).json({ error: 'rate limit exceeded' })
    return false
  }
  current.count += 1
  inMemoryBuckets.set(key, current)
  return true
}
