import { useState } from 'react'
import { useRouter } from 'next/router'

export default function ReferencesPage() {
  const router = useRouter()
  const { id } = router.query
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  async function upload(e: any) {
    e.preventDefault()
    if (!file || !id) return alert('file and device id required')
    const form = new FormData()
    form.append('file', file)
    form.append('deviceId', id as string)
    form.append('title', title)
    const res = await fetch('/api/references/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (res.ok) alert('Uploaded and indexed: ' + data.indexedPages)
    else alert('Failed: ' + (data.error || ''))
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Reference</h2>
      <form onSubmit={upload} className="space-y-3">
        <div>
          <label className="block">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 w-full" />
        </div>
        <div>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white">Upload & Index</button>
      </form>
    </div>
  )
}
