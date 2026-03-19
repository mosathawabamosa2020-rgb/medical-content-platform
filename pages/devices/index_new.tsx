import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Device = {
  id: string
  name: string
  model: string
  description: string | null
  createdAt: string
  references: Array<{ id: string; title: string }>
}

export default function DevicesPage() {
  const { data: session } = useSession()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/devices')
      .then((r) => r.json())
      .then((data) => {
        setDevices((data.items || data.devices || []) as Device[])
        setLoading(false)
      })
      .catch(() => {
        setError('فشل تحميل الأجهزة')
        setLoading(false)
      })
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* شريط التنقل */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الأجهزة الطبية</h1>
          <p className="text-gray-600 mt-2">قائمة بجميع الأجهزة الطبية المخزنة في النظام مع المراجع المتصلة بها</p>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/" className="px-3 py-2 hover:bg-gray-100">الرئيسية</Link>
          <Link href="/library" className="px-3 py-2 hover:bg-gray-100">المكتبة</Link>
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

      {/* حالة التحميل */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الأجهزة...</p>
        </div>
      )}

      {/* قائمة الأجهزة */}
      {!loading && devices.length > 0 && (
        <>
          {/* إحصائيات */}
          <section className="mb-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">إحصائيات النظام</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">إجمالي الأجهزة</h3>
                <p className="text-4xl font-bold text-blue-600">{devices.length}</p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">المراجع المتصلة</h3>
                <p className="text-4xl font-bold text-green-600">
                  {devices.reduce((sum, device) => sum + device.references.length, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">الأجهزة النشطة</h3>
                <p className="text-4xl font-bold text-purple-600">
                  {devices.filter((d) => d.references.length > 0).length}
                </p>
              </div>
            </div>
          </section>

          {/* قائمة الأجهزة */}
          <section>
            <h2 className="text-2xl font-bold mb-6">قائمة الأجهزة</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <article key={device.id} className="rounded-lg border bg-white p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">{device.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">الموديل: {device.model}</p>
                      {device.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">{device.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      نشط
                    </span>
                  </div>

                  {/* المراجع المتصلة */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">المراجع المتصلة ({device.references.length})</h4>
                    {device.references.length > 0 ? (
                      <ul className="space-y-2">
                        {device.references.slice(0, 3).map((ref) => (
                          <li key={ref.id} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600">•</span>
                            <Link
                              href={`/reference/${ref.id}`}
                              className="text-blue-800 hover:underline"
                            >
                              {ref.title}
                            </Link>
                          </li>
                        ))}
                        {device.references.length > 3 && (
                          <li className="text-sm text-gray-600">
                            +{device.references.length - 3} مراجع أخرى
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">لا توجد مراجع متصلة</p>
                    )}
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center gap-3 mt-6">
                    <Link
                      href={`/devices/${device.id}`}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center"
                    >
                      عرض التفاصيل
                    </Link>
                    <Link
                      href={`/create?device=${device.id}`}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-center"
                    >
                      إنشاء محتوى
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* رسالة عند عدم وجود أجهزة */}
          {!loading && devices.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد أجهزة مخزنة</h3>
              <p className="text-gray-600 mb-6">يمكنك البحث في المصادر الخارجية وإضافة المراجع لإنشاء أجهزة جديدة</p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/create"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  إنشاء جهاز جديد
                </Link>
                <Link
                  href="/library"
                  className="px-6 py-3 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50"
                >
                  تصفح المكتبة
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
