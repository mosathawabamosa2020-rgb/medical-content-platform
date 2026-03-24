import { useRouter } from 'next/router'

export default function ContentDetailPage() {
  const router = useRouter()
  const id = String(router.query.id || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Content Preview</h1>
      <p>Generated content ID: {id || 'N/A'}</p>
    </main>
  )
}


export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
