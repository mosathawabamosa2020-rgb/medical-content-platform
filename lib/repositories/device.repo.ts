import prisma from '../prisma'

export function findDeviceById(id: string) {
  return prisma.device.findUnique({ where: { id } })
}

