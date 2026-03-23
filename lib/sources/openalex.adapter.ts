import type { SearchResultItem } from './SourceAdapter'
import { appendOpenAlexPolitePool, fetchWithSourcePolicy } from './source-runtime'

export default class OpenAlexAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    const q = (query || '').trim()
    if (!q) return []
    const baseUrl = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=10`
    const url = appendOpenAlexPolitePool(baseUrl)
    const response = await fetchWithSourcePolicy('openalex', url)
    if (!response.ok) return []
    const payload: any = await response.json()
    const results = Array.isArray(payload?.results) ? payload.results : []
    return results.map((item: any) => ({
      id: String(item?.id || ''),
      title: item?.display_name || 'OpenAlex work',
      summary: item?.abstract_inverted_index ? 'abstract available' : undefined,
      sourceUrl: item?.id || undefined,
      sourceName: 'OpenAlex',
      reliabilityScore: 0.85,
      authors: Array.isArray(item?.authorships)
        ? item.authorships.map((a: any) => a?.author?.display_name).filter(Boolean)
        : undefined,
    }))
  }

  async fetchById(id: string): Promise<any> {
    const url = appendOpenAlexPolitePool(`https://api.openalex.org/works/${encodeURIComponent(id)}`)
    const response = await fetchWithSourcePolicy('openalex', url)
    if (!response.ok) return null
    return response.json()
  }

  async fetchFullText(id: string): Promise<string | null> {
    try {
      const item = await this.fetchById(id)
      return item?.abstract_inverted_index ? 'abstract available' : null
    } catch {
      return null
    }
  }
}
