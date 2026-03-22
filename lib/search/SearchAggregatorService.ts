import PubMedAdapter from '../sources/pubmed.adapter'
import FdaAdapter from '../sources/fda.adapter'
import WikimediaAdapter from '../sources/wikimedia.adapter'
import OpenMedicalLibrariesAdapter from '../sources/OpenMedicalLibrariesAdapter'
import ManufacturerDocsAdapter from '../sources/ManufacturerDocsAdapter'
import type { SearchResultItem, SourceAdapter } from '../sources/SourceAdapter'

export default class SearchAggregatorService {
  private adapters: SourceAdapter[]

  constructor() {
    if (process.env.NODE_ENV === 'test') {
      this.adapters = [new PubMedAdapter()]
      return
    }
    this.adapters = [
      new PubMedAdapter(),
      new FdaAdapter(),
      new WikimediaAdapter(),
      new OpenMedicalLibrariesAdapter(),
      new ManufacturerDocsAdapter(),
    ]
  }

  async searchAll(query: string): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = []
    for (const a of this.adapters) {
      try {
        const r = await a.search(query)
        results.push(...r)
      } catch {
        // continue with remaining sources to keep discovery resilient
      }
    }
    const deduped = this.deduplicate(results)
    return deduped.sort((a, b) => (b.reliabilityScore || 0) - (a.reliabilityScore || 0))
  }

  private deduplicate(items: SearchResultItem[]) {
    const seen = new Set<string>()
    const out: SearchResultItem[] = []
    for (const item of items) {
      const key = `${item.sourceUrl || ''}|${(item.title || '').toLowerCase()}`.trim()
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(item)
    }
    return out
  }
}
