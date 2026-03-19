import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../../lib/auth'
import type { ReferenceDetailResponse, VerificationDecisionPayload } from '../../../../lib/contracts/api'

export default function ReferenceVerificationDetail() {
  const router = useRouter()
  const { id } = router.query
  const [ref, setRef] = useState<ReferenceDetailResponse | null>(null)
  const [decision, setDecision] = useState<'approved'|'rejected'|''>('')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/reference/${id}`)
        .then(r => r.ok ? r.json() : Promise.reject('not found'))
        .then((data: ReferenceDetailResponse) => setRef(data))
        .catch(() => {
          setMessage('Failed to load reference')
          setMessageType('error')
        })
    }
  }, [id])

  const submit = async () => {
    if (!decision || submitting) return
    setSubmitting(true)
    setMessage(null)
    setMessageType(null)
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment } satisfies VerificationDecisionPayload)
      })
      if (res.ok) {
        setMessage('Verification submitted successfully.')
        setMessageType('success')
        router.push('/admin/verification/references')
        return
      }
      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        setMessage('Conflict: this reference was already reviewed by another user.')
      } else if (res.status >= 500) {
        setMessage('Server error while submitting verification. Please retry.')
      } else {
        setMessage(data.error || 'Submission failed.')
      }
      setMessageType('error')
    } catch {
      setMessage('Network error while submitting verification.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ref) return <div className="p-6"><p>Loading...</p></div>

  return (
    <div className="p-6">
      <h1>Verify Reference</h1>
      {message && (
        <p className={messageType === 'error' ? 'mb-4 text-red-700' : 'mb-4 text-green-700'}>{message}</p>
      )}
      <div className="mb-4">
        <strong>Title:</strong> {ref.title}<br />
        <strong>Source:</strong> {ref.sourceName || '-'}<br />
        <strong>Source ID:</strong> {ref.sourceId || '-'}<br />
        <strong>URL:</strong> {ref.sourceUrl || '-'}
      </div>
      <div className="mb-4">
        <label className="block"><input type="radio" name="decision" value="approved" onChange={() => setDecision('approved')} checked={decision==='approved'} /> Approve</label>
        <label className="block"><input type="radio" name="decision" value="rejected" onChange={() => setDecision('rejected')} checked={decision==='rejected'} /> Reject</label>
      </div>
      <div className="mb-4">
        <textarea className="w-full" placeholder="Optional comment" value={comment} onChange={e => setComment(e.target.value)} />
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white disabled:opacity-60"
        onClick={submit}
        disabled={!decision || submitting}
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
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
