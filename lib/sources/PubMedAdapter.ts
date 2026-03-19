import fetch from 'node-fetch'
import type { SearchResultItem, SourceAdapter } from './SourceAdapter'

const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const PUBMED_SUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'

export default class PubMedAdapter implements SourceAdapter {
  async search(query: string) {
    // use esearch to get ids, then esummary to fetch metadata
    const params = new URLSearchParams({ db: 'pubmed', term: query, retmode: 'json', retmax: '20' })
    const r = await fetch(`${PUBMED_SEARCH_URL}?${params.toString()}`)
    const j = await r.json()
    const ids = (j.esearchresult?.idlist || []) as string[]
    if (!ids.length) return []

    const sumParams = new URLSearchParams({ db: 'pubmed', id: ids.join(','), retmode: 'json' })
    const s = await fetch(`${PUBMED_SUMMARY_URL}?${sumParams.toString()}`)
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
    // fetch summary for now
    const sumParams = new URLSearchParams({ db: 'pubmed', id, retmode: 'json' })
    const s = await fetch(`${PUBMED_SUMMARY_URL}?${sumParams.toString()}`)
    const sj = await s.json()
    return sj.result?.[id]
  }

  async fetchFullText(id: string) {
    // PubMed often doesn't host full text; try to obtain abstract/summary as fallback
    try {
      const summary = await this.fetchById(id)
      // prefer 'extract' fields if available, otherwise return title+summary
      const txt = summary?.extract || summary?.title || summary?.summary || null
      return txt
    } catch {
      return null
    }
  }
}
