import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function VerificationQueue() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/references/queue')
        if (!res.ok) throw new Error('failed to load')
        const data = await res.json()
        setItems(data.items || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Verification Queue</h1>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map(it => (
          <li key={it.id}>
            <Link href={`/admin/references/${it.id}`}><a>{it.title || '(no title)'} — {it.sourceName || ''}</a></Link>
            <div style={{ fontSize: 12, color: '#666' }}>{it.uploadedAt}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
