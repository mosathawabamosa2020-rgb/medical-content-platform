import fetch from 'node-fetch'
import type { SearchResultItem, SourceAdapter } from './SourceAdapter'

export default class WikimediaAdapter implements SourceAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    const q = encodeURIComponent((query || '').trim())
    if (!q) return []
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&utf8=1`
    const response = await fetch(url)
    if (!response.ok) return []
    const data: any = await response.json()
    const list = Array.isArray(data?.query?.search) ? data.query.search : []
    return list.slice(0, 8).map((item: any) => ({
      id: String(item?.pageid || ''),
      title: item?.title || 'Wikimedia entry',
      summary: item?.snippet?.replace(/<[^>]+>/g, '') || undefined,
      sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(item?.title || '')}`,
      sourceName: 'Wikimedia',
      reliabilityScore: 0.7,
    }))
  }

  async fetchById(id: string): Promise<any> {
    return { id }
  }

  async fetchFullText(id: string): Promise<string | null> {
    void id
    return null
  }
}
