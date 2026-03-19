import fs from 'fs'
import path from 'path'

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

describe('admin API auth coverage', () => {
  it('ensures every admin API route enforces admin auth', () => {
    const adminDir = path.join(process.cwd(), 'pages', 'api', 'admin')
    const files = walk(adminDir)

    const missing = files.filter((file) => {
      const src = fs.readFileSync(file, 'utf8')
      const hasWrapper = /(withAdminAuth|withReviewerOrAdminAuth|withRoleAuth)\s*\(/.test(src)
      const hasSessionGate =
        /getServerSession\s*\(/.test(src) &&
        /(session\.user\?\.role\s*!==\s*['"]admin['"]|\(session as any\)\.user\?\.role\s*!==\s*['"]admin['"])/.test(src)
      return !(hasWrapper || hasSessionGate)
    })

    expect(missing).toEqual([])
  })
})
