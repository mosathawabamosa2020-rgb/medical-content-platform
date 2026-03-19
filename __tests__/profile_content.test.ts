const { renderContent, fetchProfile } = require('../tools/generate_profile_content')

test('renderContent produces output sections', () => {
  const profile = {
    'Risks and Warnings': 'Always be careful. This is dangerous.',
    'Core Components': 'Component A, Component B'
  }
  const output = renderContent(profile)
  expect(output).toMatch(/PUBLIC VERSION/)
  expect(output).toMatch(/Risks and Warnings/)
  expect(output).toMatch(/Core Components/)
})

// We'll mock Prisma for fetchProfile to verify status filtering
jest.mock('@prisma/client', () => {
  const mPrisma = {
    $queryRawUnsafe: jest.fn()
  }
  return { PrismaClient: jest.fn(() => mPrisma) }
})

const { PrismaClient } = require('@prisma/client')

beforeEach(() => {
  PrismaClient.mockClear()
  PrismaClient().$queryRawUnsafe.mockReset()
})

test('fetchProfile filters out rejected sections', async () => {
  const fakeRows = [
    { title: 'A', content: '1' },
    { title: 'B', content: '2' }
  ]
  PrismaClient().$queryRawUnsafe.mockResolvedValue(fakeRows)
  const profile = await fetchProfile('K00000')
  expect(profile).toEqual({ A: '1', B: '2' })
  expect(PrismaClient().$queryRawUnsafe).toHaveBeenCalledWith(
    expect.stringContaining("s.status != 'rejected'"),
    'K00000'
  )
})

test('reference version logic increments correctly', () => {
  function computeVersion(lastRef) {
    return lastRef ? lastRef.version + 1 : 1
  }
  expect(computeVersion(null)).toBe(1)
  expect(computeVersion({version: 1})).toBe(2)
  expect(computeVersion({version: 42})).toBe(43)
})
