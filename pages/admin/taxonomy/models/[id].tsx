import { useRouter } from 'next/router'

export default function DeviceModelDetailPage() {
  const router = useRouter()
  const id = String(router.query.id || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Model Detail</h1>
      <p>Model ID: {id || 'N/A'}</p>
    </main>
  )
}


export { requireAdminServerSideProps as getServerSideProps } from '../../../../lib/auth/requireAdminServerSideProps'
