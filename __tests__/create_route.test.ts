import fs from 'fs'
import path from 'path'

describe('/create route', () => {
  test('exists and uses content generation API', () => {
    const file = fs.readFileSync(path.join(__dirname, '../pages/create.tsx'), 'utf8')
    expect(file).toMatch(/export default function CreatePage/)
    expect(file).toMatch(/\/api\/content\/generate/)
  })
})
