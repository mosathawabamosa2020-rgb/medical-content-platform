import { deriveSourceIdentifiers } from '../lib/sourceIdentifiers'

describe('sourceIdentifiers', () => {
  test('derives pmid for pubmed source id', () => {
    const out = deriveSourceIdentifiers({
      sourceName: 'PubMed',
      sourceId: ' 12345678 ',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      title: 'Study',
    })
    expect(out.pmid).toBe('12345678')
    expect(out.sourceFingerprint).toBe('pmid:12345678')
  })

  test('extracts doi and arxiv id from combined text', () => {
    const out = deriveSourceIdentifiers({
      sourceUrl: 'https://example.org/paper',
      title: 'We cite DOI 10.1000/xyz123 and arXiv:2401.01234v2',
    })
    expect(out.doi).toBe('10.1000/xyz123')
    expect(out.arxivId).toBe('2401.01234')
  })

  test('returns null identifiers when no signal exists', () => {
    const out = deriveSourceIdentifiers({ title: 'plain title' })
    expect(out.doi).toBeNull()
    expect(out.pmid).toBeNull()
    expect(out.arxivId).toBeNull()
  })

  test('normalizes URL tracking noise for deterministic fingerprint', () => {
    const a = deriveSourceIdentifiers({
      sourceUrl: 'https://Example.org/paper/?utm_source=x&gclid=abc&id=42',
    })
    const b = deriveSourceIdentifiers({
      sourceUrl: 'https://example.org/paper?id=42',
    })
    expect(a.sourceFingerprint).toBe(b.sourceFingerprint)
  })
})
