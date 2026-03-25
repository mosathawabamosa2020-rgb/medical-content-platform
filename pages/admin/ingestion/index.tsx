import Link from 'next/link'

export default function AdminIngestionPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Admin Ingestion</h1>
      <ul className="space-y-2">
        <li><Link href="/admin/research" className="underline">Research Import</Link></li>
        <li><Link href="/admin/ingestion-monitor" className="underline">Ingestion Monitor</Link></li>
        <li><Link href="/admin/scraper" className="underline">Scraper Controls</Link></li>
      </ul>
    </main>
  )
}

export { requireAdminServerSideProps as getServerSideProps } from '../../../lib/auth/requireAdminServerSideProps'
