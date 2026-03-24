import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

type SettingsShape = {
  general: { platformName: string; defaultLanguage: 'ar' | 'en' }
  processing: { retrievalTopKDefault: number; retrievalProbeDefault: number }
  ai: { openSourceMode: boolean; providerHint: string }
  updatedAt: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsShape | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readiness, setReadiness] = useState<any>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/settings')
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'failed to load settings')
      setSettings(j)
    } catch (err: any) {
      setError(err?.message || 'failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => null)
    fetch('/api/health/dependencies')
      .then((r) => r.json())
      .then((j) => setReadiness(j))
      .catch(() => setReadiness(null))
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'failed to save settings')
      setSettings(j)
    } catch (err: any) {
      setError(err?.message || 'failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link href="/admin" className="underline">Back to admin</Link>
      </header>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700">{error}</p> : null}

      {readiness ? (
        <div className="mb-6 rounded border p-4">
          <div className="font-semibold">Startup Readiness</div>
          <div className="text-sm">Status: {readiness.status}</div>
          {readiness.summary ? (
            <div className="text-xs text-gray-600">
              Required OK: {readiness.summary.requiredOk}/{readiness.summary.requiredTotal} | Optional issues: {readiness.summary.optionalIssues}
            </div>
          ) : null}
        </div>
      ) : null}

      {settings ? (
        <form onSubmit={onSave} className="space-y-6 rounded border p-5">
          <section>
            <h2 className="mb-2 text-lg font-semibold">General</h2>
            <input
              className="mb-2 w-full rounded border px-3 py-2"
              value={settings.general.platformName}
              onChange={(e) => setSettings({ ...settings, general: { ...settings.general, platformName: e.target.value } })}
            />
            <select
              className="w-full rounded border px-3 py-2"
              value={settings.general.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, general: { ...settings.general, defaultLanguage: e.target.value as 'ar' | 'en' } })}
            >
              <option value="ar">Arabic</option>
              <option value="en">English</option>
            </select>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">Processing</h2>
            <input
              className="mb-2 w-full rounded border px-3 py-2"
              type="number"
              value={settings.processing.retrievalTopKDefault}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  processing: { ...settings.processing, retrievalTopKDefault: Number(e.target.value || 5) },
                })
              }
            />
            <input
              className="w-full rounded border px-3 py-2"
              type="number"
              value={settings.processing.retrievalProbeDefault}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  processing: { ...settings.processing, retrievalProbeDefault: Number(e.target.value || 10) },
                })
              }
            />
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">AI</h2>
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.ai.openSourceMode}
                onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, openSourceMode: e.target.checked } })}
              />
              Open-source mode
            </label>
            <input
              className="w-full rounded border px-3 py-2"
              value={settings.ai.providerHint}
              onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, providerHint: e.target.value } })}
            />
          </section>

          <button disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      ) : null}
    </main>
  )
}

export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
