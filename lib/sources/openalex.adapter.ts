import type { SearchResultItem } from './SourceAdapter'

export default class OpenAlexAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    void query
    return []
  }
}
