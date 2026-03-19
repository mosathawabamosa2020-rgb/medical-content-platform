import type { NextApiRequest, NextApiResponse } from 'next'
import PubMedAdapter from '../../../lib/sources/PubMedAdapter'

// simple in-memory cache: key -> { ts, data }
const cache = new Map<string, { ts: number; data: any }>()
const TTL = 5 * 60 * 1000 // 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const q = (req.query.q as string) || ''
  if (!q) return res.status(400).json({ error: 'missing query' })

  const key = `pubmed:${q}`
  const now = Date.now()
  const cached = cache.get(key)
  if (cached && now - cached.ts < TTL) {
    return res.status(200).json({ source: 'cache', results: cached.data })
  }

  const adapter = new PubMedAdapter()
  try {
    const results = await adapter.search(q)
    cache.set(key, { ts: now, data: results })
    return res.status(200).json({ source: 'pubmed', results })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'search failed' })
  }
}
