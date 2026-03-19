const { PrismaClient } = require('@prisma/client')

async function computeMetrics(prismaClient) {
  const p = prismaClient || new PrismaClient()
  let own = false
  if (!prismaClient) {
    own = true
    await p.$connect()
  }
  try {
    const deviceCount = await p.device.count()
    const articleCount = await p.reference.count()
    const sectionCount = await p.section.count()
    // section statuses removed; only raw counts are available
    return { deviceCount, articleCount, sectionCount }
  } finally {
    if (own) await p.$disconnect()
  }
}

module.exports = { computeMetrics }
