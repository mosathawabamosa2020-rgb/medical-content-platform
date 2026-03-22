jest.mock('../lib/db/prisma', () => {
  const m = {
    reference: { findMany: jest.fn(), update: jest.fn() },
    section: { create: jest.fn() },
    ingestionLog: { create: jest.fn() }
  }
  return m
})

jest.mock('../lib/sources/pubmed.adapter', () => jest.fn())

const prisma = require('../lib/db/prisma')
const PubMedAdapter = require('../lib/sources/pubmed.adapter')
const { runIngestionWorker } = require('../lib/workers/ingestionWorker')

describe('runIngestionWorker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('processes reference with full text', async () => {
    prisma.reference.findMany.mockResolvedValue([{ id: 'r1', deviceId: 'd1', sourceName: 'PubMed', sourceId: 'pmid1' }])
    const fetchMock = jest.fn().mockResolvedValue('para1\n\npara2')
    PubMedAdapter.mockImplementation(() => ({ fetchFullText: fetchMock }))

    await runIngestionWorker()

    expect(prisma.ingestionLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ message: 'Started worker run' }) }))
    expect(prisma.ingestionLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ message: 'Processing reference r1', referenceId: 'r1' }) }))
    expect(prisma.section.create).toHaveBeenCalledTimes(2)
    // should set processing -> processed -> pending_review
    expect(prisma.reference.update).toHaveBeenCalledWith({ where: { id: 'r1' }, data: { status: 'processing' } })
    expect(prisma.reference.update).toHaveBeenCalledWith({ where: { id: 'r1' }, data: { status: 'processed' } })
    expect(prisma.reference.update).toHaveBeenCalledWith({ where: { id: 'r1' }, data: { status: 'pending_review', processingDate: expect.any(Date) } })
    expect(prisma.ingestionLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ message: 'Finished processing reference r1', referenceId: 'r1' }) }))
  })

  test('handles adapter failure gracefully', async () => {
    prisma.reference.findMany.mockResolvedValue([{ id: 'r2', deviceId: 'd2', sourceName: 'PubMed', sourceId: 'pmid2' }])
    const fetchMock = jest.fn().mockRejectedValue(new Error('network'))
    PubMedAdapter.mockImplementation(() => ({ fetchFullText: fetchMock }))

    await runIngestionWorker()

    // should have attempted processing then processed then pending_review
    expect(prisma.reference.update).toHaveBeenCalledWith({ where: { id: 'r2' }, data: { status: 'processing' } })
    expect(prisma.reference.update).toHaveBeenCalledWith({ where: { id: 'r2' }, data: { status: 'processed' } })
    expect(prisma.reference.update).toHaveBeenCalledWith({ where: { id: 'r2' }, data: { status: 'pending_review', processingDate: expect.any(Date) } })
    expect(prisma.ingestionLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ message: expect.stringContaining('Error processing reference r2'), referenceId: 'r2' }) }))
  })
})
