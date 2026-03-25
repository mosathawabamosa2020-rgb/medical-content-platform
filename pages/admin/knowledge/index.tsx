export default function KnowledgeIndexPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Knowledge Base</h1>
      <p>Browse departments and devices.</p>
    </main>
  )
}


export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
