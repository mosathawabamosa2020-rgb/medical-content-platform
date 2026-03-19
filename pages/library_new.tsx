import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Reference = {
  id: string
  title: string
  sourceName: string | null
  sourceUrl: string | null
  uploadedAt: string
  status: string
  deviceId: string | null
}

export default function LibraryPage() {
  const { data: session } = useSession()
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const limit = 12

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(category && { category }),
          ...(statusFilter !== 'all' && { status: statusFilter })
        })
        
        const res = await fetch(`/api/references/library?${params.toString()}`)
        const data = await res.json()
        setReferences(data.items || [])
        setTotal(Number(data.total || 0))
      } catch {
        setError('فشل تحميل المراجع')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [page, limit, category, statusFilter])

  const maxPage = Math.max(1, Math.ceil(total / limit))

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* شريط التنقل */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المكتبة الطبية</h1>
          <p className="text-gray-600 mt-2">قائمة بجميع المراجع الطبية الموثقة والمخزنة في النظام</p>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/" className="px-3 py-2 hover:bg-gray-100">الرئيسية</Link>
          <Link href="/devices" className="px-3 py-2 hover:bg-gray-100">الأجهزة</Link>
          <Link href="/create" className="px-3 py-2 hover:bg-gray-100">إنشاء محتوى</Link>
          {(session as any)?.user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="px-3 py-2 hover:bg-gray-100">لوحة التحكم</Link>
          )}
        </nav>
      </header>

      {/* رسالة الخطأ */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* الفلاتر */}
      <section className="mb-6 bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-4">تصفية المراجع</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">المصدر</label>
            <input
              type="text"
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-2"
              placeholder="ابحث عن مصدر..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
            <select
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">الكل</option>
              <option value="verified">موثق</option>
              <option value="pending_review">قيد المراجعة</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">العدد</label>
            <p className="text-2xl font-bold text-blue-600">{total} مرجع</p>
          </div>
        </div>
      </section>

      {/* حالة التحميل */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المراجع...</p>
        </div>
      )}

      {/* قائمة المراجع */}
      {!loading && references.length > 0 && (
        <>
          {/* إحصائيات */}
          <section className="mb-6 bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">إحصائيات المراجع</h2>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">إجمالي المراجع</h3>
                <p className="text-4xl font-bold text-blue-600">{total}</p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">المراجع الموثقة</h3>
                <p className="text-4xl font-bold text-green-600">
                  {references.filter((r) => r.status === 'verified').length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">قيد المراجعة</h3>
                <p className="text-4xl font-bold text-yellow-600">
                  {references.filter((r) => r.status === 'pending_review').length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">المرفوضة</h3>
                <p className="text-4xl font-bold text-red-600">
                  {references.filter((r) => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </section>

          {/* قائمة المراجع */}
          <section>
            <h2 className="text-2xl font-bold mb-6">المراجع ({(page - 1) * limit + 1} - {Math.min(page * limit, total)})</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {references.map((ref) => (
                <article key={ref.id} className="rounded-lg border bg-white p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-900 mb-2">{ref.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ref.status === 'verified' ? 'bg-green-100 text-green-800' :
                          ref.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ref.status === 'verified' ? 'موثق' :
                            ref.status === 'pending_review' ? 'قيد المراجعة' :
                            'مرفوض'}
                        </span>
                        {ref.sourceName && (
                          <span className="text-xs text-gray-600">{ref.sourceName}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(ref.uploadedAt).toLocaleDateString('ar-SA')}</span>
                  </div>

                  {/* الوصف */}
                  {ref.sourceUrl && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">رابط المصدر</h4>
                      <a
                        href={ref.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:underline"
                      >
                        {ref.sourceUrl}
                      </a>
                    </div>
                  )}

                  {/* الأزرار */}
                  <div className="flex items-center gap-3 mt-6">
                    <Link
                      href={`/reference/${ref.id}`}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center"
                    >
                      عرض التفاصيل
                    </Link>
                    {ref.status === 'verified' && (
                      <Link
                        href={`/create?reference=${ref.id}`}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-center"
                      >
                        إنشاء محتوى
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* ترقيم الصفحات */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-6 py-3 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-gray-600">صفحة {page} من {maxPage}</span>
              <button
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={page >= maxPage}
                className="px-6 py-3 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </section>
        </>
      )}

      {/* رسالة عند عدم وجود مراجع */}
      {!loading && references.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد مراجع مخزنة</h3>
          <p className="text-gray-600 mb-6">يمكنك البحث في المصادر الخارجية وإضافة المراجع الجديدة</p>
          <div className="flex items-center justify-center gap-4">
            <Link
                href="/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
              إضافة مرجع جديد
            </Link>
            <Link
                href="/library"
                className="px-6 py-3 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50"
              >
              البحث في المكتبة
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
