import prisma from '../prisma'

export async function listActiveSources() {
  return prisma.sourceRegistry.findMany({ where: { active: true }, orderBy: { name: 'asc' } })
}

