import Link from 'next/link'
import { useEffect, useState } from 'react'

type LibraryRef = {
  id: string
  title: string
  sourceName: string | null
  sourceUrl: string | null
  uploadedAt: string
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryRef[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(12)
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (category) params.set('category', category)
      const res = await fetch(`/api/references/library?${params.toString()}`)
      const data = await res.json()
      setItems(data.items || [])
      setTotal(Number(data.total || 0))
      setLoading(false)
    }
    run().catch(() => setLoading(false))
  }, [page, limit, category])

  const maxPage = Math.max(1, Math.ceil(total / limit))

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Library</h1>
        <Link href="/search" className="text-sm underline">Open search</Link>
      </header>

      <div className="mb-5 flex items-center gap-3">
        <label className="text-sm text-gray-600">Category</label>
        <input
          className="rounded border px-3 py-2"
          placeholder="e.g. PubMed"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {loading ? <p>Loading...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((ref) => (
          <article key={ref.id} className="rounded border p-4">
            <h2 className="font-semibold">{ref.title}</h2>
            <p className="text-sm text-gray-600">{ref.sourceName || 'Unknown source'}</p>
            <p className="text-xs text-green-700">Verified</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <Link href={`/reference/${ref.id}`} className="underline">Open</Link>
              {ref.sourceUrl ? <a href={ref.sourceUrl} target="_blank" rel="noreferrer" className="underline">Source</a> : null}
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-8 flex items-center gap-3">
        <button className="rounded border px-3 py-1" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span className="text-sm">Page {page} / {maxPage}</span>
        <button className="rounded border px-3 py-1" disabled={page >= maxPage} onClick={() => setPage((p) => p + 1)}>Next</button>
      </footer>
    </main>
  )
}
