import { useState } from 'react'
import { mutate } from 'swr'

export default function Research() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [imported, setImported] = useState<Record<string, boolean>>({})

  async function runSearch() {
    setLoading(true)
    const r = await fetch(`/api/search/pubmed?term=${encodeURIComponent(q)}`)
    const j = await r.json()
    setResults(j.results || [])
    setLoading(false)
  }

  async function importArticle(item: any) {
    if (!deviceId) return alert('select device id (device must exist)')
    const body = { deviceId, pmid: item.id, title: item.title, authors: item.authors, pubDate: item.pubDate, sourceUrl: item.sourceUrl }
    const r = await fetch('/api/admin/ingestion/import', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
    const j = await r.json()
    if (r.status === 201) {
      setImported(prev => ({ ...prev, [item.id]: true }))
      mutate('/api/admin/stats')
      alert('imported: ' + j.referenceId)
    } else if (r.status === 409) {
      alert('duplicate: ' + j.referenceId)
      setImported(prev => ({ ...prev, [item.id]: true }))
    } else {
      alert('error: ' + j.error)
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Researcher Cockpit</h1>
      <div className="mb-4">
        <input className="border p-2 mr-2" placeholder="deviceId" value={deviceId} onChange={e=>setDeviceId(e.target.value)} />
        <input className="border p-2 mr-2 w-96" placeholder="query" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={runSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search PubMed</button>
      </div>

      {loading && <div>Loading…</div>}

      <ul>
        {results.map(r=> (
          <li key={r.id} className="mb-3 p-3 border rounded">
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm text-gray-600">{(r.authors||[]).join(', ')}</div>
            <div className="text-sm text-gray-500">{r.pubDate}</div>
            <div className="mt-2">
              <button
                className="mr-2 bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                onClick={()=>importArticle(r)}
                disabled={!!imported[r.id]}
              >
                {imported[r.id] ? 'Imported' : 'Import to System'}
              </button>
              <a className="underline" href={r.sourceUrl} target="_blank" rel="noreferrer">Preview</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
