import { createMocks } from 'node-mocks-http'

// global in-memory state to emulate Prisma
let references: any[] = []
let logs: any[] = []

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    reference: {
      findFirst: jest.fn(({ where }) => {
        return Promise.resolve(references.find(r => r.deviceId === where.deviceId && r.sourceName === where.sourceName && r.sourceId === where.sourceId) || null)
      }),
      findMany: jest.fn(({ where }) => {
        // simple filter by status
        if (where && where.status) {
          return Promise.resolve(references.filter(r => r.status === where.status))
        }
        return Promise.resolve(references.slice())
      }),
      create: jest.fn(({ data }) => {
        const id = `ref${references.length + 1}`
        // if caller passed status undefined, default to pending_ingestion
        const rec = { id, status: 'pending_ingestion', ...data }
        if (rec.status === undefined) rec.status = 'pending_ingestion'
        references.push(rec)
        return Promise.resolve(rec)
      }),
      update: jest.fn(({ where, data }) => {
        const idx = references.findIndex(r => r.id === where.id)
        if (idx !== -1) {
          references[idx] = { ...references[idx], ...data }
          return Promise.resolve(references[idx])
        }
        return Promise.resolve(null)
      }),
      updateMany: jest.fn(({ where, data }) => {
        const matches = references.filter(r => r.id === where.id && (where.status ? r.status === where.status : true))
        // apply the update to in-memory records so subsequent counts reflect change
        if (data && data.status) {
          matches.forEach(m => { m.status = data.status })
        }
        return Promise.resolve({ count: matches.length })
      }),
      count: jest.fn(({ where }) => {
        if (where && where.status) {
          return Promise.resolve(references.filter(r => r.status === where.status).length)
        }
        return Promise.resolve(references.length)
      })
    },
    ingestionLog: {
      findMany: jest.fn(({ orderBy }) => {
        return Promise.resolve(logs.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
      }),
      create: jest.fn(({ data }) => {
        const entry = { id: `log${logs.length + 1}`, createdAt: new Date().toISOString(), ...data }
        logs.push(entry)
        return Promise.resolve(entry)
      })
    },
    section: {
      create: jest.fn(({ data }) => Promise.resolve({ id: `sec${Math.random()}`, ...data }))
    },
    verificationLog: {
      create: jest.fn()
    },
    $disconnect: jest.fn(),
    $connect: jest.fn()
  }
  const ReferenceStatus = {
    pending_ingestion: 'pending_ingestion',
    processing: 'processing',
    processed: 'processed',
    pending_review: 'pending_review',
    verified: 'verified',
    rejected: 'rejected',
    archived: 'archived'
  }
  return { PrismaClient: jest.fn(() => mPrisma), ReferenceStatus }
})

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

jest.mock('../lib/sources/PubMedAdapter', () => jest.fn())

const PubMedAdapter = require('../lib/sources/PubMedAdapter')
const { runIngestionWorker } = require('../lib/workers/ingestionWorker')
const { PrismaClient } = require('@prisma/client')

describe('Phase 2a end-to-end flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const prisma = PrismaClient()
    prisma.$transaction = jest.fn().mockImplementation(async (cb: any) => cb(prisma))
    references = []
    logs = []
  })

  test('admin can search, import, run worker, and stats update accordingly', async () => {
    // setup pubmed search to return a single item
    const fakeItem = { id: 'pmid123', title: 'Stent study', authors: 'A', pubDate: '2020', sourceUrl: 'http://example' }
    PubMedAdapter.mockImplementation(() => ({ search: jest.fn().mockResolvedValue([fakeItem]), fetchFullText: jest.fn().mockResolvedValue('full text') }))

    // 1. search
    const { req: req1, res: res1 } = createMocks({ method: 'GET', query: { term: 'stent' } })
    const searchHandler = require('../pages/api/search/pubmed').default
    await searchHandler(req1 as any, res1 as any)
    expect(res1._getStatusCode()).toBe(200)
    const searchResp = JSON.parse(res1._getData())
    expect(searchResp.results).toEqual([fakeItem])

    // stats before import
    const statsHandler = require('../pages/api/admin/stats').default
    const { getServerSession } = require('next-auth/next') as any
    getServerSession.mockResolvedValue({ user: { role: 'admin' } })
    const { req: reqStats0, res: resStats0 } = createMocks({ method: 'GET' })
    await statsHandler(reqStats0 as any, resStats0 as any)
    expect(JSON.parse(resStats0._getData())).toEqual({ ingestedCount: 0, verificationCount: 0, knowledgeLibraryCount: 0 })

    // 2. import article
    const body = { deviceId: 'dev1', pmid: fakeItem.id, title: fakeItem.title, authors: fakeItem.authors, pubDate: fakeItem.pubDate, sourceUrl: fakeItem.sourceUrl }
    const { req: req2, res: res2 } = createMocks({ method: 'POST', body })
    const importHandler = require('../pages/api/admin/ingestion/import').default
    await importHandler(req2 as any, res2 as any)
    expect(res2._getStatusCode()).toBe(201)
    const impResp = JSON.parse(res2._getData())
    expect(impResp.referenceId).toBeDefined()

    // verify reference in memory has pending status (should be set by create mock default)
    expect(references.length).toBe(1)
    expect(references[0]).toMatchObject({ deviceId: 'dev1', sourceName: 'PubMed', sourceId: fakeItem.id, status: 'pending_ingestion' })

    // stats after import
    const { req: reqStats1, res: resStats1 } = createMocks({ method: 'GET' })
    await statsHandler(reqStats1 as any, resStats1 as any)
    // debug log for reference array
    // eslint-disable-next-line no-console
    console.log('references state after import', references)
    expect(JSON.parse(resStats1._getData())).toEqual({ ingestedCount: 1, verificationCount: 0, knowledgeLibraryCount: 0 })

    // 3. run worker directly
    await runIngestionWorker()

    // after worker, count changes
    const { req: reqStats2, res: resStats2 } = createMocks({ method: 'GET' })
    await statsHandler(reqStats2 as any, resStats2 as any)
    expect(JSON.parse(resStats2._getData())).toEqual({ ingestedCount: 0, verificationCount: 1, knowledgeLibraryCount: 0 })

    // verify the reference using new API
    const refId = references[0].id
    const { req: reqVer, res: resVer } = createMocks({
      method: 'POST',
      query: { id: refId },
      body: { decision: 'approved', comment: 'good' }
    })
    // simulate admin session
    getServerSession.mockResolvedValue({ user: { role: 'admin', id: 'u' } })
    const verHandler = require('../pages/api/admin/verification/[id]').default
    await verHandler(reqVer as any, resVer as any)
    expect(resVer._getStatusCode()).toBe(200)

    // stats should now reflect library count
    const { req: reqStats3, res: resStats3 } = createMocks({ method: 'GET' })
    await statsHandler(reqStats3 as any, resStats3 as any)
    expect(JSON.parse(resStats3._getData())).toEqual({ ingestedCount: 0, verificationCount: 0, knowledgeLibraryCount: 1 })

    // logs should contain start and success
    const logsHandler = require('../pages/api/admin/ingestion/logs').default
    const { req: reqLogs, res: resLogs } = createMocks({ method: 'GET' })
    await logsHandler(reqLogs as any, resLogs as any)
    const logResp = JSON.parse(resLogs._getData())
    expect(logResp.logs.some((l: any) => l.message.includes('Started worker run'))).toBe(true)
    expect(logResp.logs.some((l: any) => l.message.includes('Finished processing'))).toBe(true)
  })
})
