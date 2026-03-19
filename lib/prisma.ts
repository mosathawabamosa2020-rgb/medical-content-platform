import { PrismaClient } from '@prisma/client'
// validate environment early
import './env'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma
