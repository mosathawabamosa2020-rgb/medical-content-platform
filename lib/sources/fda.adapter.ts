import type { SearchResultItem, SourceAdapter } from './SourceAdapter'
import { fetchWithSourcePolicy } from './source-runtime'

const FDA_510K_URL = 'https://api.fda.gov/device/510k.json'

export default class FdaAdapter implements SourceAdapter {
  async search(query: string): Promise<SearchResultItem[]> {
    const normalized = (query || '').trim()
    if (!normalized) return []
    const search = encodeURIComponent(`device_name:${normalized}*`)
    const url = `${FDA_510K_URL}?search=${search}&limit=10`
    const response = await fetchWithSourcePolicy('fda', url)
    if (!response.ok) return []
    const data: any = await response.json()
    const results = Array.isArray(data?.results) ? data.results : []
    return results.map((r: any) => {
      const kNumber = r?.k_number || r?.kNumber || 'unknown'
      return {
        id: String(kNumber),
        title: r?.device_name || `FDA 510(k) ${kNumber}`,
        summary: r?.statement_or_summary || r?.applicant || undefined,
        sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${kNumber}`,
        sourceName: 'FDA',
        reliabilityScore: 0.98,
      }
    })
  }

  async fetchById(id: string): Promise<any> {
    const search = encodeURIComponent(`k_number:${id}`)
    const url = `${FDA_510K_URL}?search=${search}&limit=1`
    const response = await fetchWithSourcePolicy('fda', url)
    if (!response.ok) return null
    const data: any = await response.json()
    return Array.isArray(data?.results) ? data.results[0] || null : null
  }

  async fetchFullText(id: string): Promise<string | null> {
    void id
    return null
  }
}
