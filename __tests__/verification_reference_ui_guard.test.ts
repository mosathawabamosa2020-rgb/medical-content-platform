import fs from 'fs'
import path from 'path'

describe('verification reference UI hardening', () => {
  test('enforces submit guard, loading disable, and conflict messaging', () => {
    const file = path.join(process.cwd(), 'pages', 'admin', 'verification', 'references', '[id].tsx')
    const src = fs.readFileSync(file, 'utf8')

    expect(src).toMatch(/const \[submitting,\s*setSubmitting\]/)
    expect(src).toMatch(/if \(!decision \|\| submitting\) return/)
    expect(src).toMatch(/disabled=\{!decision \|\| submitting\}/)
    expect(src).toMatch(/res\.status === 409/)
    expect(src).toMatch(/Conflict: this reference was already reviewed by another user\./)
    expect(src).not.toMatch(/alert\s*\(/)
  })
})

