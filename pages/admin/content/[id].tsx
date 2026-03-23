import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
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


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }
  return { props: {} }
}
