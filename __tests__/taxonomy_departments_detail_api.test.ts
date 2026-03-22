import { createMocks } from 'node-mocks-http'

const findUnique = jest.fn()
const update = jest.fn()
const count = jest.fn()

jest.mock('../lib/middleware/withAdminAuth', () => ({
  withAdminAuth: (h: any) => h,
}))

jest.mock('../lib/auditTrail', () => ({
  writeAuditEvent: jest.fn(),
}))

jest.mock('../lib/db/prisma', () => ({
  __esModule: true,
  default: {
    department: {
      findUnique,
      update,
    },
    device: {
      count,
    },
  },
}))

describe('taxonomy department detail API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    count.mockResolvedValue(0)
  })

  test('PATCH supports activation state update', async () => {
    update.mockResolvedValue({ id: 'dep1', isActive: false })
    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'dep1' },
      body: { isActive: false },
    })
    const handler = require('../pages/api/admin/taxonomy/departments/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dep1' },
        data: expect.objectContaining({ isActive: false }),
      })
    )
  })

  test('DELETE archives instead of hard delete', async () => {
    update.mockResolvedValue({ id: 'dep1', isActive: false, archivedAt: new Date() })
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { id: 'dep1' },
    })
    const handler = require('../pages/api/admin/taxonomy/departments/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dep1' },
        data: expect.objectContaining({ isActive: false }),
      })
    )
  })

  test('PATCH rejects deactivation when active devices exist', async () => {
    count.mockResolvedValue(2)
    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'dep1' },
      body: { isActive: false },
    })
    const handler = require('../pages/api/admin/taxonomy/departments/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(409)
    expect(update).not.toHaveBeenCalled()
  })
})
