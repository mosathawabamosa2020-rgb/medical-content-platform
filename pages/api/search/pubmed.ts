import type { NextApiRequest, NextApiResponse } from 'next'
import SearchAggregatorService from '../../../lib/search/SearchAggregatorService'

// simple in-memory cache keyed by term
const cache = new Map<string, { results: any[]; expires: number }>()
const TTL = 5 * 60 * 1000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const term = req.query.term as string
  if (!term) return res.status(400).json({ error: 'term query required' })

  const now = Date.now()
  const cached = cache.get(term)
  if (cached && cached.expires > now) {
    return res.status(200).json({ results: cached.results })
  }

  try {
    const service = new SearchAggregatorService()
    const results = await service.searchAll(term)
    cache.set(term, { results, expires: now + TTL })
    res.status(200).json({ results })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: 'search failed' })
  }
}
