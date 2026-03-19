import prisma from '../prisma'

export async function listGeneratedContent() {
  return prisma.generatedContent.findMany({ orderBy: { createdAt: 'desc' } })
}

