import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { FormEvent, useEffect, useState } from 'react'
import type { RetrievalQueryResponse } from '../lib/contracts/api'

type RefCard = { id: string; title: string; sourceName: string | null; uploadedAt: string }

type SearchResult = {
  id: string
  title: string
  snippet: string
  referenceId: string
  sourceUrl: string | null
  sourceName: string | null
}

export default function PortalHome() {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featured, setFeatured] = useState<RefCard[]>([])
  const [recent, setRecent] = useState<RefCard[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/references/library?featured=true&limit=6').then((r) => r.json()),
      fetch('/api/references/library?recent=true&limit=6').then((r) => r.json()),
    ])
      .then(([f, rr]) => {
        setFeatured(f.items || [])
        setRecent(rr.items || [])
      })
      .catch(() => undefined)
  }, [])

  async function onSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setShowResults(false)
    try {
      const res = await fetch('/api/references/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 8, page: 1 }),
      })
      const data = (await res.json()) as RetrievalQueryResponse
      if (!res.ok) throw new Error((data as any).error || 'search failed')
      
      // تحويل النتائج إلى صيغة موحدة
      const formattedResults: SearchResult[] = data.results.map((r) => ({
        id: r.id,
        title: r.reference.title || 'بدون عنوان',
        snippet: r.snippet || '',
        referenceId: r.reference.id,
        sourceUrl: r.reference.sourceUrl || null,
        sourceName: 'مصدر غير معروف',
      }))
      
      setSearchResults(formattedResults)
      setShowResults(true)
    } catch (err: any) {
      setError(err?.message || 'فشل البحث')
    } finally {
      setLoading(false)
    }
  }

  async function onExternalSearch(term: string) {
    try {
      const res = await fetch(`/api/search/pubmed?term=${encodeURIComponent(term)}`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.map((r: any) => ({
          id: r.id || Date.now().toString(),
          title: r.title || 'بدون عنوان',
          snippet: r.summary || r.title || '',
          referenceId: r.id || '',
          sourceUrl: r.sourceUrl || null,
          sourceName: 'PubMed',
        })))
        setShowResults(true)
      }
    } catch (err: any) {
      setError(err?.message || 'فشل البحث الخارجي')
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* شريط التنقل الرئيسي */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold">منصة المعرفة الطبية</h1>
          <nav className="flex items-center gap-3">
            <Link href="/library" className="px-3 py-2 hover:bg-gray-100">المكتبة</Link>
            <Link href="/devices" className="px-3 py-2 hover:bg-gray-100">الأجهزة</Link>
            <Link href="/create" className="px-3 py-2 hover:bg-gray-100">إنشاء محتوى</Link>
            {(session as any)?.user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="px-3 py-2 hover:bg-gray-100">لوحة التحكم</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <span className="text-sm text-gray-600">
              مرحباً، {session.user?.name || 'المستخدم'}
            </span>
          ) : (
            <Link href="/api/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded">تسجيل الدخول</Link>
          )}
        </div>
      </header>

      {/* قسم البحث الرئيسي */}
      <section className="mb-8 rounded-lg border bg-gradient-to-br from-blue-50 to-white p-6">
        <h2 className="text-2xl font-bold mb-4">البحث الذكي</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">البحث في قاعدة البيانات</h3>
            <form onSubmit={onSearch} className="space-y-3">
              <input
                className="w-full rounded-lg border-2 border-blue-300 px-4 py-3"
                placeholder="ابحث في المحتوى الطبي الموثق..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold disabled:opacity-50"
              >
                {loading ? 'جاري البحث...' : 'بحث'}
              </button>
            </form>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">البحث في المصادر الخارجية</h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg border-2 border-blue-300 px-4 py-3"
                placeholder="ابحث في PubMed..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={() => onExternalSearch(query)}
                className="w-full bg-green-600 text-white rounded-lg px-4 py-3 font-semibold"
              >
                بحث في PubMed
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}
      </section>

      {/* عرض النتائج */}
      {showResults && searchResults.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">نتائج البحث</h2>
            <button
              onClick={() => setShowResults(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              إغلاق النتائج
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((result) => (
              <article key={result.id} className="rounded-lg border bg-white p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-blue-900">{result.title}</h3>
                  <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    {result.sourceName === 'PubMed' ? 'PubMed' : 'موثق'}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{result.snippet}</p>
                <div className="flex items-center gap-3 mt-4">
                  {result.sourceUrl && (
                    <a
                      href={result.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold hover:bg-blue-200"
                    >
                      عرض المصدر
                    </a>
                  )}
                  {result.referenceId && (
                    <Link
                      href={`/reference/${result.referenceId}`}
                      className="px-4 py-2 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50"
                    >
                      عرض التفاصيل
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* المراجع المميزة */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">المراجع المميزة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((ref) => (
            <Link
              key={ref.id}
              href={`/reference/${ref.id}`}
              className="rounded-lg border bg-white p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-2">{ref.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{ref.sourceName || 'مصدر غير معروف'}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  موثق
                </span>
                <span className="text-xs text-gray-500">{new Date(ref.uploadedAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* المراجع الحديثة */}
      <section>
        <h2 className="text-2xl font-bold mb-4">المراجع الحديثة</h2>
        <ul className="space-y-3">
          {recent.map((ref) => (
            <li key={ref.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow">
              <Link
                href={`/reference/${ref.id}`}
                className="flex items-center justify-between w-full"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900">{ref.title}</h3>
                  <p className="text-sm text-gray-600">{ref.sourceName || 'مصدر غير معروف'}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(ref.uploadedAt).toLocaleDateString('ar-SA')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
