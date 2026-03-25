import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function IngestionMonitor() {
  useSession({ required: true })
  const { data, error, mutate } = useSWR('/api/admin/ingestion/logs', fetcher)

  const logs = data?.logs || []

  return (
    <div className="flex h-screen">
      <nav className="w-64 bg-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">Admin Menu</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/admin/research" className="text-blue-600 hover:underline">
              Search
            </Link>
          </li>
          <li>
            <Link href="/admin/verification" className="text-blue-600 hover:underline">
              Section Verification
            </Link>
          </li>
          <li>
            <Link href="/admin/verification/references" className="text-blue-600 hover:underline">
              Reference Verification
            </Link>
          </li>
          <li>
            <Link href="/admin/ingestion-monitor" className="text-blue-600 hover:underline font-semibold">
              Ingestion Monitor
            </Link>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Ingestion Monitor</h1>
        <button
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
          onClick={async () => {
            await fetch('/api/admin/ingestion/run-worker', { method: 'POST' })
            await mutate()
          }}
        >
          Run Worker Now
        </button>
        {error && <p className="text-red-600">Failed to load logs</p>}
        <ul className="space-y-2">
          {logs.map((l: any) => (
            <li key={l.id} className="border p-2 rounded">
              <div className="text-sm text-gray-500">{new Date(l.createdAt).toLocaleString()}</div>
              <div>{l.message}</div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export { requireAdminServerSideProps as getServerSideProps } from '../../lib/auth/requireAdminServerSideProps'
