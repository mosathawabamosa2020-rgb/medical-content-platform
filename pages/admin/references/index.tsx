import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'

export default function AdminReferencesPage() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/admin/references/queue')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => undefined)
  }, [])

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Admin References</h1>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded border p-3">
            <Link href={`/admin/references/${item.id}`} className="underline">{item.title}</Link>
            <div className="text-xs text-gray-500">Audit trail: /api/admin/reference/{item.id}</div>
          </li>
        ))}
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
