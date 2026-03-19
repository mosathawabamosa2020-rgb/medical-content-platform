import fs from 'fs'
import path from 'path'

describe('admin dashboard page', () => {
  test('contains placeholder metrics and navigation links', () => {
    const file = fs.readFileSync(path.join(__dirname, '../pages/admin/dashboard.tsx'), 'utf8')
    expect(file).toMatch(/New Items Ingested/)
    expect(file).toMatch(/Items Pending Verification/)
    expect(file).toMatch(/Knowledge Library Count/)
    expect(file).toMatch(/User Activity Log/)
    expect(file).toMatch(/href="\/admin\/research"/)
    expect(file).toMatch(/href="\/admin\/verification"/)
    expect(file).toMatch(/href="\/admin\/ingestion-monitor"/)
    expect(file).toMatch(/useSWR/) // dashboard uses SWR for stats
    expect(file).toMatch(/\/api\/admin\/stats/) // ensures endpoint is referenced
  })
})
