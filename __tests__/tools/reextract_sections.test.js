const fs = require('fs')
// we will spy on fs methods rather than mocking entire module
jest.mock('pdf-parse', () => jest.fn())
jest.mock('../../dist/lib/sectionExtractor', () => ({ extractSections: jest.fn() }), { virtual: true })

const { extractSections } = require('../../dist/lib/sectionExtractor')
// require after mocking so it is replaced with mock function
const pdf = require('pdf-parse')

const { reextractAll } = require('../../tools/reextract_sections')

jest.mock('@prisma/client', () => {
  const mPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    reference: {
      findMany: jest.fn(),
      update: jest.fn()
    },
    section: { create: jest.fn() }
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

describe('reextract_sections tool', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('appends new sections and updates processingDate', async () => {
    const mockRefs = [
      { id: 'r1', deviceId: 'd1', filePath: '/path1', processingDate: null }
    ]
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('dummy'))
    pdf.mockResolvedValue({ text: 'Page1\fPage2' })
    extractSections.mockReturnValue([
      { title: 'S1', content: 'C1' },
      { title: 'S2', content: 'C2' }
    ])
    const prismaInstance = new (require('@prisma/client').PrismaClient)()
    prismaInstance.reference.findMany.mockResolvedValue(mockRefs)
    prismaInstance.section.create.mockResolvedValue({})
    prismaInstance.reference.update.mockResolvedValue({})

    await reextractAll(prismaInstance)

    expect(prismaInstance.reference.findMany).toHaveBeenCalled()
    expect(prismaInstance.section.create).toHaveBeenCalledTimes(2)
    expect(prismaInstance.reference.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { processingDate: expect.any(Date) }
    })
  })
})
