import { useRouter } from 'next/router'

export default function KnowledgeDevicePage() {
  const router = useRouter()
  const deviceId = String(router.query.deviceId || '')
  return (
    <main style={{ padding: 16 }}>
      <h1>Device Knowledge Tabs</h1>
      <p>Device ID: {deviceId || 'N/A'}</p>
    </main>
  )
}

