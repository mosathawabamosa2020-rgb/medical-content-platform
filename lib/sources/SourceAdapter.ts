export interface SearchResultItem {
  id: string
  title: string
  authors?: string[]
  summary?: string
  sourceUrl?: string
  sourceName?: string
  reliabilityScore?: number
}

export interface SourceAdapter {
  // search with query+filters, return list of results
  search(query: string, opts?: any): Promise<SearchResultItem[]>

  // fetch full record by id
  fetchById(id: string): Promise<any>

  // attempt to fetch full text / full content for a source id
  fetchFullText(id: string): Promise<string | null>
}
