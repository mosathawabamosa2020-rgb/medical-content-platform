import { createMocks } from 'node-mocks-http'

const findMany = jest.fn()
const create = jest.fn()

jest.mock('../lib/middleware/withAdminAuth', () => ({
  withAdminAuth: (h: any) => h,
}))

jest.mock('../lib/db/prisma', () => ({
  __esModule: true,
  default: {
    department: {
      findMany,
      create,
    },
  },
}))

describe('taxonomy departments API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET returns items', async () => {
    findMany.mockResolvedValue([{ id: 'dep1', name: 'Radiology' }])
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/taxonomy/departments/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData()).items).toHaveLength(1)
  })

  test('GET applies inactive state filter', async () => {
    findMany.mockResolvedValue([])
    const { req, res } = createMocks({ method: 'GET', query: { state: 'inactive' } })
    const handler = require('../pages/api/admin/taxonomy/departments/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: false } }))
  })

  test('POST validates payload', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { name: '' } })
    const handler = require('../pages/api/admin/taxonomy/departments/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('POST creates department', async () => {
    create.mockResolvedValue({ id: 'dep2', name: 'ICU' })
    const { req, res } = createMocks({ method: 'POST', body: { name: 'ICU' } })
    const handler = require('../pages/api/admin/taxonomy/departments/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(201)
    expect(create).toHaveBeenCalled()
  })
})
