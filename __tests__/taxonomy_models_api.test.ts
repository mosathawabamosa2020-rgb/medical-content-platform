import { createMocks } from 'node-mocks-http'

const findMany = jest.fn()
const create = jest.fn()
const findUnique = jest.fn()

jest.mock('../lib/adminAuth', () => ({
  withAdminAuth: (h: any) => h,
}))

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    device: {
      findUnique,
    },
    deviceModel: {
      findMany,
      create,
    },
  },
}))

describe('taxonomy models API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET supports list', async () => {
    findMany.mockResolvedValue([{ id: 'm1', modelName: 'X100', deviceId: 'd1' }])
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/taxonomy/models/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData()).items).toHaveLength(1)
  })

  test('POST rejects invalid deviceId', async () => {
    findUnique.mockResolvedValue(null)
    const { req, res } = createMocks({
      method: 'POST',
      body: { deviceId: 'missing', modelName: 'X100' },
    })
    const handler = require('../pages/api/admin/taxonomy/models/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('POST creates model', async () => {
    findUnique.mockResolvedValue({ id: 'd1' })
    create.mockResolvedValue({ id: 'm2', modelName: 'X200', deviceId: 'd1' })
    const { req, res } = createMocks({
      method: 'POST',
      body: { deviceId: 'd1', modelName: 'X200' },
    })
    const handler = require('../pages/api/admin/taxonomy/models/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(201)
    expect(create).toHaveBeenCalled()
  })
})
