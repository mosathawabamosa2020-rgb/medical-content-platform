import { createMocks } from 'node-mocks-http'

const findMany = jest.fn()
const count = jest.fn()

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    device: {
      findMany,
      count,
    },
  },
}))

describe('GET /api/devices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('rejects invalid knowledgeStatus filter', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { knowledgeStatus: 'bad' },
    })
    const handler = require('../pages/api/devices/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('returns paginated device payload', async () => {
    findMany.mockResolvedValue([
      {
        id: 'd1',
        name: 'Ventilator',
        model: 'V-100',
        references: [
          { id: 'r1', status: 'verified' },
          { id: 'r2', status: 'verified' },
          { id: 'r3', status: 'verified' },
        ],
      },
      {
        id: 'd2',
        name: 'Monitor',
        model: 'M-20',
        references: [{ id: 'r4', status: 'pending_review' }],
      },
    ])
    count.mockResolvedValue(2)

    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '20' },
    })
    const handler = require('../pages/api/devices/index').default
    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(200)
    const body = JSON.parse(res._getData())
    expect(body.items).toHaveLength(2)
    expect(body.items[0]).toMatchObject({
      id: 'd1',
      name: 'Ventilator',
      department: null,
      models: ['V-100'],
      knowledgeStatus: 'complete',
    })
    expect(body.items[1].knowledgeStatus).toBe('in_progress')
  })
})
