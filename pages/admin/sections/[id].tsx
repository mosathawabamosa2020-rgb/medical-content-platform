import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
import { GetServerSideProps } from 'next'

export default function SectionReview() {
  const router = useRouter()
  const { id } = router.query
  const [section, setSection] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetch(`/api/admin/sections/${id}`)
        .then(r => r.json())
        .then(setSection)
    }
  }, [id])

  async function updateStatus(newStatus: 'verified' | 'rejected') {
    if (!id || typeof id !== 'string') return
    setLoading(true)
    const endpoint = `/api/admin/sections/${id}/${newStatus}`
    const res = await fetch(endpoint, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      router.push('/admin/verification')
    } else {
      alert('Failed to update status')
    }
  }

  if (!section) return <div className="p-6">Loading…</div>

  const fileName = section.reference?.filePath ? section.reference.filePath.split(/[\\/]/).pop() : null

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Review Section</h1>
      <div className="mt-4">
        <h2 className="font-semibold">{section.title || '(no title)'}</h2>
        <div className="mt-2 whitespace-pre-wrap border p-4 rounded bg-white">{section.content}</div>
        <div className="mt-4 text-sm text-gray-600">
          Reference: {section.reference?.title || fileName || 'unknown'}{' '}
          {fileName && (
            <a href={`/api/admin/file?name=${encodeURIComponent(fileName)}`} target="_blank" rel="noreferrer" className="underline text-blue-600">[open]</a>
          )}
          {section.reference?.sourceUrl && (
            <a href={section.reference.sourceUrl} target="_blank" rel="noreferrer" className="underline text-blue-600 ml-2">[source]</a>
          )}
        </div>
        <div className="mt-6 flex gap-4">
          <button onClick={() => updateStatus('verified')} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">Verify</button>
          <button onClick={() => updateStatus('rejected')} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }
  return { props: {} }
}
