import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Dashboard() {
  useSession({ required: true })
  const { data } = useSWR('/api/admin/stats', fetcher)
  const { data: readiness } = useSWR('/api/health/dependencies', fetcher)

  const ingested = data?.ingestedCount ?? '...'
  const verification = data?.verificationCount ?? '...'
  const knowledge = data?.knowledgeLibraryCount ?? '...'
  const readinessStatus = readiness?.status || 'unknown'
  const readinessSummary = readiness?.summary

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
            <Link href="/admin/ingestion-monitor" className="text-blue-600 hover:underline">
              Ingestion Monitor
            </Link>
          </li>
          {/* future links: content studio, etc. */}
        </ul>
      </nav>
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Executive Dashboard</h1>
        <div className="mb-6 rounded border p-4">
          <div className="font-semibold">Startup Readiness</div>
          <div className="text-sm">Status: {readinessStatus}</div>
          {readinessSummary ? (
            <div className="text-xs text-gray-600">
              Required OK: {readinessSummary.requiredOk}/{readinessSummary.requiredTotal} | Optional issues: {readinessSummary.optionalIssues}
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-4 border rounded shadow">New Items Ingested: {ingested}</div>
          <div className="p-4 border rounded shadow">Items Pending Verification: {verification}</div>
          <div className="p-4 border rounded shadow">Knowledge Library Count: {knowledge}</div>
        </div>
        <div className="border rounded shadow p-4">
          <h2 className="font-semibold mb-2">User Activity Log</h2>
          <p className="text-gray-500">[placeholder]</p>
        </div>
      </main>
    </div>
  )
}
