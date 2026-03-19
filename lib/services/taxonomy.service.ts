import prisma from '../prisma'

export async function listDepartments() {
  return prisma.department.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
}

