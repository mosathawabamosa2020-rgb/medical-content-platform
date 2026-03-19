import fs from 'fs'
import path from 'path'

describe('ingestion monitor page', () => {
  test('contains SWR and logs API endpoint', () => {
    const file = fs.readFileSync(path.join(__dirname, '../pages/admin/ingestion-monitor.tsx'), 'utf8')
    expect(file).toMatch(/useSWR/)
    expect(file).toMatch(/\/api\/admin\/ingestion\/logs/)
    expect(file).toMatch(/Ingestion Monitor/)
    expect(file).toMatch(/Run Worker Now/)
  })
})
