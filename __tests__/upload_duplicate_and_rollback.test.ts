import { createMocks } from 'node-mocks-http'
import fs from 'fs'
import os from 'os'
import path from 'path'

let mockFields: any = {}
let mockFiles: any = {}
const pdfParse = jest.fn(async () => ({ text: 'pdf text', numpages: 1 }))
const deriveSourceIdentifiers = jest.fn(() => ({}))

jest.mock('formidable', () => ({
  __esModule: true,
  default: () => ({
    parse: (_req: any, cb: any) => cb(null, mockFields, mockFiles),
  }),
}))

jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: (...args: any[]) => pdfParse(...args),
}))

jest.mock('../lib/apiSecurity', () => ({
  enforceCsrfForMutation: () => true,
  enforceRateLimit: () => true,
  setSecurityHeaders: () => undefined,
}))

jest.mock('../lib/db/prisma', () => ({
  __esModule: true,
  default: {
    reference: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    ingestionLog: { create: jest.fn() },
  },
}))

jest.mock('../lib/sourceIdentifiers', () => ({
  deriveSourceIdentifiers: (...args: any[]) => deriveSourceIdentifiers(...args),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => ({ user: { id: 'u1', role: 'admin' } })),
}))

const storeBuffer = jest.fn()
jest.mock('../lib/storage/storageAdapter', () => ({
  resolveMinioBucket: () => 'references',
  storeBuffer: (...args: any[]) => storeBuffer(...args),
}))

describe('upload duplicate and rollback behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFields = {}
    mockFiles = {}
    deriveSourceIdentifiers.mockReturnValue({})
    storeBuffer.mockResolvedValue({ filePath: 'minio://references/ref1.pdf' })
  })

  function setupPdfFile() {
    const tempPath = path.join(os.tmpdir(), `test_upload_${Date.now()}.pdf`)
    fs.writeFileSync(tempPath, Buffer.from('pdfdata'))
    mockFiles = {
      file: {
        filepath: tempPath,
        mimetype: 'application/pdf',
        size: 100,
      },
    }
    return tempPath
  }

  test('returns 409 on duplicate by identifiers', async () => {
    const prisma = require('../lib/db/prisma').default
    deriveSourceIdentifiers.mockReturnValue({ pmid: 'pmid1' })
    prisma.reference.findFirst.mockResolvedValue({ id: 'dup1' })

    setupPdfFile()
    mockFields = { deviceId: 'd1', title: 't1' }

    const { req, res } = createMocks({ method: 'POST', headers: { host: 'localhost:3000', origin: 'http://localhost:3000' } })
    const handler = require('../pages/api/references/upload').default
    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(409)
    expect(JSON.parse(res._getData()).error).toBe('duplicate source identifiers')
    expect(prisma.ingestionLog.create).toHaveBeenCalled()
  })

  test('rolls back reference on file write failure', async () => {
    const prisma = require('../lib/db/prisma').default
    prisma.reference.findFirst.mockResolvedValue(null)
    prisma.reference.create.mockResolvedValue({ id: 'ref1' })

    setupPdfFile()
    mockFields = { deviceId: 'd1', title: 't2' }

    storeBuffer.mockRejectedValueOnce(new Error('write failed'))

    const { req, res } = createMocks({ method: 'POST', headers: { host: 'localhost:3000', origin: 'http://localhost:3000' } })
    const handler = require('../pages/api/references/upload').default
    await handler(req as any, res as any)

    expect(prisma.reference.delete).toHaveBeenCalled()
    expect(res._getStatusCode()).toBe(500)
  })
})
