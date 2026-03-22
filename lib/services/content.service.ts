import prisma from '../db/prisma'

export async function listGeneratedContent() {
  return prisma.generatedContent.findMany({ orderBy: { createdAt: 'desc' } })
}


