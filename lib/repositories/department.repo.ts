import prisma from '../db/prisma'

export function findDepartmentById(id: string) {
  return prisma.department.findUnique({ where: { id } })
}


