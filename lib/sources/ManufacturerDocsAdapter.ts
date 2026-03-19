import type { SearchResultItem, SourceAdapter } from './SourceAdapter'

const MANUFACTURERS = [
  { name: 'GE Healthcare', host: 'gehealthcare.com' },
  { name: 'Philips', host: 'philips.com' },
  { name: 'Siemens Healthineers', host: 'siemens-healthineers.com' },
  { name: 'Mindray', host: 'mindray.com' },
]

export default class ManufacturerDocsAdapter implements SourceAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    const q = (query || '').trim()
    if (!q) return []
    return MANUFACTURERS.map((m) => ({
      id: `${m.name}:${q}`.replace(/\s+/g, '_'),
      title: `${m.name} documentation for ${q}`,
      summary: `Manufacturer documentation lookup target for ${q}`,
      sourceUrl: `https://${m.host}`,
      sourceName: `${m.name} Docs`,
      reliabilityScore: 0.88,
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
