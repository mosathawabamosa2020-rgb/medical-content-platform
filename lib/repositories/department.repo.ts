import prisma from '../prisma'

export function findDepartmentById(id: string) {
  return prisma.department.findUnique({ where: { id } })
}

