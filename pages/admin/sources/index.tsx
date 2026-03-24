import { FormEvent, useEffect, useState } from 'react'

type Source = {
  id: string
  name: string
  baseUrl: string
  active: boolean
  rateLimitPolicy: string
  lastFetchedAt: string | null
}

export default function AdminSourcesPage() {
  const [items, setItems] = useState<Source[]>([])
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [rateLimitPolicy, setRateLimitPolicy] = useState('60 req/min')
  const [saving, setSaving] = useState(false)

  const load = () =>
    fetch('/api/admin/sources')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => undefined)

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, baseUrl, rateLimitPolicy }),
    })
    setSaving(false)
    setName('')
    setBaseUrl('')
    load()
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Source Registry</h1>
      <form onSubmit={onSubmit} className="mb-6 grid gap-3 rounded border p-4 md:grid-cols-3">
        <input className="rounded border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded border p-2" placeholder="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        <input className="rounded border p-2" placeholder="Rate limit policy" value={rateLimitPolicy} onChange={(e) => setRateLimitPolicy(e.target.value)} />
        <button disabled={saving || !name || !baseUrl} className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Register Source'}
        </button>
      </form>
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.id} className="rounded border p-3">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-gray-600">{s.baseUrl}</div>
            <div className="text-xs text-gray-500">Policy: {s.rateLimitPolicy} | Active: {String(s.active)}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
