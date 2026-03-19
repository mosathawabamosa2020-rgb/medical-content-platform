import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../lib/auth'

export default function AdminHome() {
  const [readiness, setReadiness] = useState<'ok' | 'degraded' | 'blocked' | 'loading'>('loading')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => setReadiness(j?.status || 'degraded'))
      .catch(() => setReadiness('degraded'))
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Admin</h1>
      {readiness !== 'ok' && readiness !== 'loading' ? (
        <div className={`mb-4 rounded border px-4 py-2 text-sm ${readiness === 'blocked' ? 'border-red-400 bg-red-50 text-red-700' : 'border-amber-400 bg-amber-50 text-amber-800'}`}>
          System readiness is <strong>{readiness}</strong>. Run <code>npm run ops:preflight</code> before operations.
        </div>
      ) : null}
      <ul className="space-y-2">
        <li><Link href="/admin/dashboard" className="underline">Dashboard</Link></li>
        <li><Link href="/admin/references" className="underline">References</Link></li>
        <li><Link href="/admin/verification" className="underline">Verification</Link></li>
        <li><Link href="/admin/taxonomy" className="underline">Taxonomy</Link></li>
        <li><Link href="/admin/settings" className="underline">Settings</Link></li>
        <li><Link href="/admin/ingestion" className="underline">Ingestion</Link></li>
        <li><Link href="/admin/logs" className="underline">Logs</Link></li>
        <li><Link href="/admin/sources" className="underline">Sources</Link></li>
      </ul>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = (await getServerSession(ctx.req as any, ctx.res as any, authOptions as any)) as any
  if (!session || session.user?.role !== 'admin') {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }
  return { props: {} }
}
