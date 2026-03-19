import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title = 'منصة المعرفة الطبية' }: LayoutProps) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل الرئيسي */}
      <nav className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            {/* الشعار */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">م</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{title}</span>
              </Link>
              
              {/* روابط التنقل الرئيسية */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/">الرئيسية</NavLink>
                <NavLink href="/devices">الأجهزة</NavLink>
                <NavLink href="/library">المكتبة</NavLink>
                <NavLink href="/create">إنشاء محتوى</NavLink>
              </div>
            </div>

            {/* حالة المستخدم */}
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <span className="text-sm text-gray-700">
                    مرحباً، {session.user?.name || 'المستخدم'}
                  </span>
                  {(session as any)?.user?.role === 'admin' && (
                    <NavLink href="/admin/dashboard">لوحة التحكم</NavLink>
                  )}
                  <button
                    onClick={() => window.location.href = '/api/auth/signout'}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>

      {/* التذييل */}
      <footer className="bg-white border-t mt-12">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">منصة المعرفة الطبية</h3>
              <p className="text-sm text-gray-600">
                منصة متكاملة للبحث والجلب الذكي للمحتوى الطبي الموثق من مصادر متعددة
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-blue-600">عن المنصة</Link></li>
                <li><Link href="/help" className="hover:text-blue-600">المساعدة</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">اتصل بنا</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">الدعم الفني</h3>
              <p className="text-sm text-gray-600 mb-2">
                البريد الإلكتروني: support@medical-platform.com
              </p>
              <p className="text-sm text-gray-600">
                الهاتف: +966 50 000 0000
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2026 منصة المعرفة الطبية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
    >
      {children}
    </Link>
  )
}