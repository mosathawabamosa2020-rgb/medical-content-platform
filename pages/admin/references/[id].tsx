import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ReferenceReviewRedirect() {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!id) return
    router.replace(`/admin/verification/references/${id}`)
  }, [id, router])

  return (
    <div style={{ padding: 20 }}>
      <h1>Reference Review</h1>
      <p>This legacy route now redirects to the canonical verification flow.</p>
    </div>
  )
}
