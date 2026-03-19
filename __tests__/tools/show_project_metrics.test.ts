const { computeMetrics } = require('../../tools/show_project_metrics')

jest.mock('@prisma/client', () => {
  const counts = { device: 5, reference: 10, section: 20 }
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      device: { count: jest.fn().mockResolvedValue(counts.device) },
      reference: { count: jest.fn().mockResolvedValue(counts.reference) },
      section: {
        count: jest.fn().mockResolvedValue(counts.section)
      }
    }))
  }
})

describe('show_project_metrics tool', () => {
  it('computeMetrics returns correct structure', async () => {
    const m = await computeMetrics()
    expect(m).toMatchObject({
      deviceCount: 5,
      articleCount: 10,
      sectionCount: 20
    })
  })
})
