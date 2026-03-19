import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import type { RetrievalQueryResponse } from '../lib/contracts/api'
import Link from 'next/link'

export default function SearchPage() {
  const router = useRouter()
  const initialQuery = typeof router.query.q === 'string' ? router.query.q : ''
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RetrievalQueryResponse | null>(null)

  const runSearch = async (nextPage = 1) => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/references/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, page: nextPage, topK: 10 }),
      })
      const body = (await res.json()) as RetrievalQueryResponse
      if (!res.ok) throw new Error((body as any).error || 'search failed')
      setData(body)
      setPage(nextPage)
    } catch (err: any) {
      setError(err?.message || 'search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) runSearch(1).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await runSearch(1)
    router.replace({ pathname: '/search', query: { q: query } }, undefined, { shallow: true })
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-5 text-3xl font-bold">Search</h1>
      <form onSubmit={onSubmit} className="mb-6 flex gap-3">
        <input className="w-full rounded border px-4 py-2" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button disabled={loading || !query.trim()} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error ? <p className="mb-4 text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {data?.results.map((r) => (
          <article key={r.id} className="rounded border p-4">
            <div className="mb-1 flex items-center justify-between">
              <Link href={`/reference/${r.reference.id}`} className="font-semibold hover:underline">
                {r.reference.title || 'Untitled'}
              </Link>
              <span className="text-xs text-gray-500">{r.score.toFixed(3)}</span>
            </div>
            <p className="text-sm text-gray-700">{r.snippet}</p>
            <div className="mt-1 text-xs text-gray-500">Section: {r.sectionMatch}</div>
            <div className="mt-1 text-xs text-green-700">Verified</div>
          </article>
        ))}
      </div>

      <footer className="mt-6 flex items-center gap-3">
        <button disabled={page <= 1 || loading} onClick={() => runSearch(page - 1)} className="rounded border px-3 py-1">Prev</button>
        <span className="text-sm">Page {page}</span>
        <button disabled={!data?.meta.hasMore || loading} onClick={() => runSearch(page + 1)} className="rounded border px-3 py-1">Next</button>
      </footer>
    </main>
  )
}
