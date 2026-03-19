import type { SearchResultItem } from './SourceAdapter'

export default class SemanticScholarAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    void query
    return []
  }
}
