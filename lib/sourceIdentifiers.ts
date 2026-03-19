type SourceIdentifiers = {
  doi: string | null
  pmid: string | null
  arxivId: string | null
  sourceFingerprint: string | null
}

function normalize(value: string | undefined | null): string | null {
  if (!value) return null
  const out = value.trim().toLowerCase()
  return out.length > 0 ? out : null
}

const TRACKING_QUERY_PREFIXES = ['utm_', 'fbclid', 'gclid', 'mc_cid', 'mc_eid', 'ref', 'source']

function normalizeUrl(sourceUrl: string | undefined | null): string | null {
  if (!sourceUrl) return null
  try {
    const url = new URL(sourceUrl)
    url.hash = ''
    url.username = ''
    url.password = ''
    url.protocol = url.protocol.toLowerCase()
    url.hostname = url.hostname.toLowerCase()
    if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
      url.port = ''
    }

    const keys = Array.from(url.searchParams.keys())
    for (const key of keys) {
      const lower = key.toLowerCase()
      if (TRACKING_QUERY_PREFIXES.some((x) => lower === x || lower.startsWith(x))) {
        url.searchParams.delete(key)
      }
    }

    const sorted = Array.from(url.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b))
    url.search = ''
    for (const [k, v] of sorted) url.searchParams.append(k, v)
    url.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '')
    return normalize(url.toString())
  } catch {
    return normalize(sourceUrl)
  }
}

function extractDoi(input: string): string | null {
  const m = input.match(/\b10\.\d{4,9}\/[-._;()/:a-z0-9]+\b/i)
  return normalize(m?.[0] || null)
}

function extractPmid(input: string): string | null {
  const explicit = input.match(/\bpmid\s*[:#]?\s*(\d{5,12})\b/i)
  if (explicit?.[1]) return normalize(explicit[1])
  const pubmedPath = input.match(/pubmed(?:\.ncbi\.nlm\.nih\.gov)?\/(\d{5,12})/i)
  if (pubmedPath?.[1]) return normalize(pubmedPath[1])
  return null
}

function extractArxiv(input: string): string | null {
  const m = input.match(/\barxiv\s*[:#]?\s*([a-z\-\.]+\/\d{7}|\d{4}\.\d{4,5})(v\d+)?\b/i)
  if (!m?.[1]) return null
  return normalize(m[1])
}

export function deriveSourceIdentifiers(params: {
  sourceUrl?: string | null
  sourceId?: string | null
  sourceName?: string | null
  title?: string | null
}): SourceIdentifiers {
  const sourceUrl = params.sourceUrl || ''
  const sourceId = params.sourceId || ''
  const sourceName = params.sourceName || ''
  const title = params.title || ''
  const combined = `${sourceUrl} ${sourceId} ${title}`

  const doi = extractDoi(combined)
  const pmid = normalize(sourceName.toLowerCase() === 'pubmed' ? sourceId : null) || extractPmid(combined)
  const arxivId = extractArxiv(combined)

  // Identity precedence: DOI > PMID > arXiv > canonical URL > source tuple.
  // This keeps dedup deterministic when some identifiers are missing.
  const canonicalUrl = normalizeUrl(sourceUrl)
  const sourceFingerprint =
    (doi ? `doi:${doi}` : null) ||
    (pmid ? `pmid:${pmid}` : null) ||
    (arxivId ? `arxiv:${arxivId}` : null) ||
    (canonicalUrl ? `url:${canonicalUrl}` : null) ||
    ([normalize(sourceName), normalize(sourceId)].filter(Boolean).join('|') || null)

  return { doi, pmid, arxivId, sourceFingerprint }
}
