import { createMocks } from 'node-mocks-http'

const loadSettings = jest.fn()
const saveSettings = jest.fn()
const writeAuditEvent = jest.fn()

jest.mock('../lib/middleware/withAdminAuth', () => ({
  withAdminAuth: (h: any) => h,
}))

jest.mock('../lib/settingsStore', () => ({
  loadSettings,
  saveSettings,
}))

jest.mock('../lib/auditTrail', () => ({
  writeAuditEvent,
}))

describe('admin settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET returns persisted settings', async () => {
    loadSettings.mockReturnValue({ general: { platformName: 'x', defaultLanguage: 'ar' } })
    const { req, res } = createMocks({ method: 'GET' })
    const handler = require('../pages/api/admin/settings/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
  })

  test('PATCH validates payload', async () => {
    const { req, res } = createMocks({
      method: 'PATCH',
      body: { processing: { retrievalTopKDefault: 0 } },
    })
    const handler = require('../pages/api/admin/settings/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  test('PATCH saves settings and emits audit event', async () => {
    saveSettings.mockReturnValue({ ok: true })
    const { req, res } = createMocks({
      method: 'PATCH',
      body: { general: { platformName: 'Medical Platform' } },
    })
    const handler = require('../pages/api/admin/settings/index').default
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(200)
    expect(saveSettings).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalled()
  })
})
