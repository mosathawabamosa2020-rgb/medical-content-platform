import { FormEvent, useState } from 'react'
import type { GeneratedContentResponse } from '../lib/contracts/api'

export default function CreatePage() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'x'>('instagram')
  const [contentType, setContentType] = useState<'scientific_device' | 'generic'>('scientific_device')
  const [includeReel, setIncludeReel] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<GeneratedContentResponse | null>(null)

  const [script, setScript] = useState('')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [voiceoverText, setVoiceoverText] = useState('')
  const [saving, setSaving] = useState(false)

  async function onGenerate(e: FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, platform, contentType, includeReel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'generation failed')
      setOutput(data)
      setScript(data.script)
      setCaption(data.caption)
      setHashtags((data.hashtags || []).join(' '))
      setVoiceoverText(data.voiceoverText)
    } catch (err: any) {
      setError(err?.message || 'generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function onSave() {
    if (!output?.id) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/content/${output.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          caption,
          hashtags: hashtags.split(/\s+/).filter(Boolean),
          voiceoverText,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'save failed')
      setOutput((prev) => (prev ? { ...prev, ...data } : prev))
    } catch (err: any) {
      setError(err?.message || 'save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Create Content</h1>
      <form onSubmit={onGenerate} className="mb-6 space-y-3 rounded border p-4">
        <input className="w-full rounded border px-3 py-2" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Tone" value={tone} onChange={(e) => setTone(e.target.value)} />
          <select className="rounded border px-3 py-2" value={platform} onChange={(e) => setPlatform(e.target.value as any)}>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="x">X</option>
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select className="rounded border px-3 py-2" value={contentType} onChange={(e) => setContentType(e.target.value as any)}>
            <option value="scientific_device">Scientific Device Post</option>
            <option value="generic">Generic Evidence Post</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeReel} onChange={(e) => setIncludeReel(e.target.checked)} />
            Include Reel Script
          </label>
        </div>
        <button disabled={loading || !topic.trim()} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error ? <p className="mb-4 text-red-700">{error}</p> : null}

      {output ? (
        <section className="space-y-4 rounded border p-4">
          <div className="text-xs text-gray-600">
            type: {output.contentType} | topK/probe: {output.topKUsed}/{output.probeUsed} | retrievalLatencyMs: {output.retrievalLatencyMs} | generationLatencyMs: {output.generationLatencyMs} | tokenIn/out: {output.tokenUsageInput}/{output.tokenUsageOutput}
          </div>
          {output.imageSourceUrl ? <p className="text-sm">Image source: <a className="underline" href={output.imageSourceUrl} target="_blank" rel="noreferrer">{output.imageSourceUrl}</a></p> : null}
          {output.imagePrompt ? <p className="text-sm">AI image prompt: {output.imagePrompt}</p> : null}
          {output.reelTimestampBreakdown?.length ? (
            <div className="rounded border p-3 text-sm">
              <p className="mb-2 font-semibold">Reel Breakdown</p>
              {output.reelTimestampBreakdown.map((b) => (
                <p key={`${b.at}-${b.text.slice(0, 16)}`}>{b.at} - {b.text}</p>
              ))}
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Script</span>
            <textarea className="w-full rounded border p-2" rows={6} value={script} onChange={(e) => setScript(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Caption</span>
            <textarea className="w-full rounded border p-2" rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Hashtags</span>
            <input className="w-full rounded border p-2" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Voiceover Text</span>
            <textarea className="w-full rounded border p-2" rows={5} value={voiceoverText} onChange={(e) => setVoiceoverText(e.target.value)} />
          </label>
          <button onClick={onSave} disabled={saving} className="rounded border px-4 py-2 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </section>
      ) : null}
    </main>
  )
}
