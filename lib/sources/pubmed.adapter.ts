import type { SearchResultItem, SourceAdapter } from './SourceAdapter'
import { fetchWithSourcePolicy } from './source-runtime'

const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const PUBMED_SUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'

export default class PubMedAdapter implements SourceAdapter {
  async search(query: string) {
    const params = new URLSearchParams({ db: 'pubmed', term: query, retmode: 'json', retmax: '20' })
    const r = await fetchWithSourcePolicy('pubmed', `${PUBMED_SEARCH_URL}?${params.toString()}`)
    const j = await r.json()
    const ids = (j.esearchresult?.idlist || []) as string[]
    if (!ids.length) return []

    const sumParams = new URLSearchParams({ db: 'pubmed', id: ids.join(','), retmode: 'json' })
    const s = await fetchWithSourcePolicy('pubmed', `${PUBMED_SUMMARY_URL}?${sumParams.toString()}`)
    const sj = await s.json()

    const results: SearchResultItem[] = ids.map((id: string) => {
      const rec = sj.result?.[id]
      return {
        id,
        title: rec?.title || 'No title',
        authors: (rec?.authors || []).map((a: any) => a.name),
        summary: rec?.summary || rec?.title || undefined,
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        sourceName: 'PubMed',
        reliabilityScore: 0.95,
      }
    })
    return results
  }

  async fetchById(id: string) {
    const sumParams = new URLSearchParams({ db: 'pubmed', id, retmode: 'json' })
    const s = await fetchWithSourcePolicy('pubmed', `${PUBMED_SUMMARY_URL}?${sumParams.toString()}`)
    const sj = await s.json()
    return sj.result?.[id]
  }

  async fetchFullText(id: string) {
    try {
      const summary = await this.fetchById(id)
      const txt = summary?.extract || summary?.title || summary?.summary || null
      return txt
    } catch {
      return null
    }
  }
}
