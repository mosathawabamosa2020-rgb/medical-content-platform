import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Result = { query: string; title: string; link: string; snippet?: string }

export default function DiscoverPage() {
  const router = useRouter()
  const { id } = router.query
  const [queries, setQueries] = useState<string[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/references/discovery/queries?deviceId=${id}`)
      .then((r) => r.json())
      .then((d) => setQueries(d.queries || []))
  }, [id])

  async function runSearch() {
    setLoading(true)
    try {
      const res = await fetch('/api/references/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function ingest(link: string, title?: string) {
    const res = await fetch('/api/references/discovery/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: link, deviceId: id, title }),
    })
    if (res.ok) {
      alert('Ingested successfully')
    } else {
      const err = await res.json()
      alert('Failed: ' + (err.error || ''))
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reference Discovery</h2>
      <div className="mb-4">
        <h3 className="font-medium">Generated Queries</h3>
        <ul className="list-disc pl-6">
          {queries.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <button onClick={runSearch} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded" disabled={loading || queries.length===0}>{loading? 'Searching...' : 'Search Web'}</button>
      </div>

      <div>
        <h3 className="font-medium">Results</h3>
        <ul className="space-y-3 mt-3">
          {results.map((r) => (
            <li key={r.link} className="p-3 border rounded">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-600">{r.snippet}</div>
              <div className="mt-2 flex gap-2">
                <a className="text-blue-600" href={r.link} target="_blank" rel="noreferrer">Open</a>
                <button onClick={() => ingest(r.link, r.title)} className="px-3 py-1 bg-green-600 text-white rounded">Review & Ingest</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
