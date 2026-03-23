import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }
  return { props: {} }
}
