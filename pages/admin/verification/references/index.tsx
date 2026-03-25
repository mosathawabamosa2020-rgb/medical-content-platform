import useSWR from 'swr'
import Link from 'next/link'
import type { PendingReviewListResponse } from '../../../../lib/contracts/api'

const fetcher = (url: string) => fetch(url).then(r => r.json() as Promise<PendingReviewListResponse>)

export default function ReferenceVerificationList() {
  const { data, error } = useSWR('/api/admin/references/pending_review', fetcher)

  if (error) return <div className="p-6"><p>Error loading references</p></div>
  if (!data) return <div className="p-6"><p>Loading...</p></div>

  return (
    <div className="p-6">
      <h1>Reference Verification</h1>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Title</th>
            <th className="border px-2">Source</th>
            <th className="border px-2">URL</th>
            <th className="border px-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((ref) => (
            <tr key={ref.id} className="hover:bg-gray-100">
              <td className="border px-2">{ref.title}</td>
              <td className="border px-2">{ref.sourceName || '-'}</td>
              <td className="border px-2">{ref.sourceUrl || '-'}</td>
              <td className="border px-2">
                <Link href={`/admin/verification/references/${ref.id}`} className="text-blue-600 underline">Review</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { requireAdminServerSideProps as getServerSideProps } from '../../../../lib/auth/requireAdminServerSideProps'
