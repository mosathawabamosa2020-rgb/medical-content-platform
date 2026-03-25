import { useRouter } from 'next/router'

export default function VerificationDetailPage() {
  const router = useRouter()
  const id = String(router.query.id || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Verification Detail</h1>
      <p>Reference ID: {id || 'N/A'}</p>
    </main>
  )
}


export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
