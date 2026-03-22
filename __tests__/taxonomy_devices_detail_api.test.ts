import { createMocks } from 'node-mocks-http'

const findUnique = jest.fn()
const update = jest.fn()
const depFindUnique = jest.fn()
const modelCount = jest.fn()

jest.mock('../lib/middleware/withAdminAuth', () => ({
  withAdminAuth: (h: any) => h,
}))

jest.mock('../lib/auditTrail', () => ({
  writeAuditEvent: jest.fn(),
}))

jest.mock('../lib/db/prisma', () => ({
  __esModule: true,
  default: {
    device: {
      findUnique,
      update,
    },
    department: {
      findUnique: depFindUnique,
    },
    deviceModel: {
      count: modelCount,
    },
  },
}))

describe('taxonomy device detail API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    depFindUnique.mockResolvedValue({ id: 'dep1' })
    modelCount.mockResolvedValue(0)
  })

  test('PATCH rejects deactivation when active models exist', async () => {
    modelCount.mockResolvedValue(1)
    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'dev1' },
      body: { isActive: false },
    })
    const handler = require('../pages/api/admin/taxonomy/devices/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(409)
    expect(update).not.toHaveBeenCalled()
  })

  test('DELETE archives when no active models exist', async () => {
    update.mockResolvedValue({ id: 'dev1', isActive: false })
    const { req, res } = createMocks({ method: 'DELETE', query: { id: 'dev1' } })
    const handler = require('../pages/api/admin/taxonomy/devices/[id]').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(update).toHaveBeenCalled()
  })
})
