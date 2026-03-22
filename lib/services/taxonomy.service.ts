import prisma from '../db/prisma'

export async function listDepartments() {
  return prisma.department.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
}


