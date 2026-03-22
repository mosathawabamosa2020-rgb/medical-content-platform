import prisma from '../db/prisma'

export function findDeviceById(id: string) {
  return prisma.device.findUnique({ where: { id } })
}


