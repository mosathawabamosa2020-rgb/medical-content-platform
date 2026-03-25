export default function ContentTasksPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Content Tasks</h1>
      <p>Daily content generation queue.</p>
    </main>
  )
}


export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
