import { useRouter } from 'next/router'

export default function DeviceDetailPage() {
  const router = useRouter()
  const id = String(router.query.id || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Device Knowledge Completeness</h1>
      <p>Device ID: {id || 'N/A'}</p>
    </main>
  )
}

