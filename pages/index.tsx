import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function IndexRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/dashboard').catch(() => null)
  }, [router])
  return null
}
