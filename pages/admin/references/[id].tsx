import { GetServerSideProps } from 'next'
import { requireAdminServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'

export default function ReferenceReviewRedirect() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const authResult = await requireAdminServerSideProps(ctx)
  if ('redirect' in authResult || 'notFound' in authResult) {
    return authResult
  }
  const idParam = ctx.params?.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return { redirect: { destination: '/admin/verification/references', permanent: false } }
  }
  return { redirect: { destination: `/admin/verification/references/${id}`, permanent: false } }
}
