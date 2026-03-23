import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
export default function ContentCreatePage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Create Content</h1>
      <p>Select department, device, tone, and preview output.</p>
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
