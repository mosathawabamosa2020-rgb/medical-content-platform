import fs from 'fs'
import path from 'path'

describe('/devices route', () => {
  test('exists and calls /api/devices', () => {
    const file = fs.readFileSync(path.join(__dirname, '../pages/devices/index.tsx'), 'utf8')
    expect(file).toMatch(/export default function DevicesPage/)
    expect(file).toMatch(/fetch\('\/api\/devices'\)/)
  })
})
