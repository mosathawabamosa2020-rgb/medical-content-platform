import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
export default function KnowledgeIndexPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Knowledge Base</h1>
      <p>Browse departments and devices.</p>
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
