import fetch from 'node-fetch'
import type { SearchResultItem, SourceAdapter } from './SourceAdapter'

export default class OpenMedicalLibrariesAdapter implements SourceAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    const q = encodeURIComponent((query || '').trim())
    if (!q) return []
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${q}&format=json&pageSize=10`
    const response = await fetch(url)
    if (!response.ok) return []
    const data: any = await response.json()
    const list = Array.isArray(data?.resultList?.result) ? data.resultList.result : []
    return list.map((r: any) => ({
      id: String(r?.id || r?.pmid || ''),
      title: r?.title || 'Open medical library result',
      summary: r?.authorString || r?.journalTitle || undefined,
      sourceUrl: r?.doi ? `https://doi.org/${r.doi}` : undefined,
      sourceName: 'Open Medical Libraries',
      reliabilityScore: 0.9,
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
