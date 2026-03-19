import { authOptions } from '../lib/auth'

describe('NextAuth callbacks', () => {
  test('jwt callback stores sub and role when user present', async () => {
    const token: any = {}
    const user = { id: '123', role: 'admin' }
    const result = await authOptions.callbacks.jwt({ token, user } as any)
    expect(result.sub).toBe('123')
    expect(result.role).toBe('admin')
  })

  test('session callback maps sub to session.user.id and role', async () => {
    const session: any = { user: {} }
    const token: any = { sub: '456', role: 'user' }
    const result = await authOptions.callbacks.session({ session, token } as any)
    expect(result.user.id).toBe('456')
    expect(result.user.role).toBe('user')
  })
})