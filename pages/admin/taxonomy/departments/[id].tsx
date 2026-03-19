import { useRouter } from 'next/router'

export default function DepartmentDetailPage() {
  const router = useRouter()
  const id = String(router.query.id || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Department</h1>
      <p>Department ID: {id || 'N/A'}</p>
    </main>
  )
}

