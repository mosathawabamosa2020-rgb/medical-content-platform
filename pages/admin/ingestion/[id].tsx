import { useRouter } from 'next/router'

export default function IngestionDetailPage() {
  const router = useRouter()
  const id = String(router.query.id || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Ingestion Job Detail</h1>
      <p>Job/Reference ID: {id || 'N/A'}</p>
    </main>
  )
}

