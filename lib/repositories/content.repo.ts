import prisma from '../prisma'

export function findGeneratedContentById(id: string) {
  return prisma.generatedContent.findUnique({ where: { id } })
}

