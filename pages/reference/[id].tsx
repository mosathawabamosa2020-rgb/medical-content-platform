import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type Section = { id: string; title: string; content: string; order: number }
type Detail = {
  id: string
  title: string
  sourceName: string | null
  sourceUrl: string | null
  verificationBadge: string
  sections: Section[]
}

export default function ReferenceDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/references/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('reference not found'))))
      .then((d) => setData(d))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Layout title="تفاصيل المرجع">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المرجع...</p>
        </div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout title="خطأ">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على المرجع'}</p>
          <button
            onClick={() => router.push('/library')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            العودة للمكتبة
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={data.title}>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← العودة
        </button>
        <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded">
            {data.verificationBadge || 'موثق'}
          </span>
          {data.sourceName && (
            <span className="text-sm text-gray-600">{data.sourceName}</span>
          )}
        </div>
      </div>

      {/* معلومات المصدر */}
      {data.sourceUrl && (
        <section className="mb-8 bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">معلومات المصدر</h2>
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {data.sourceUrl}
          </a>
        </section>
      )}

      {/* الأقسام */}
      {data.sections && data.sections.length > 0 && (
        <section className="mb-8 bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">الأقسام</h2>
          <div className="space-y-6">
            {data.sections.map((s) => (
              <div key={s.id}>
                <h3 className="text-lg font-bold text-blue-900 mb-3">{s.title}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{s.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-4">
        <a
          href={`/create?reference=${data.id}`}
          className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center"
        >
          إنشاء محتوى من هذا المرجع
        </a>
        <button
          onClick={() => router.push('/library')}
          className="px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
        >
          العودة للمكتبة
        </button>
      </div>
    </Layout>
  )
}
