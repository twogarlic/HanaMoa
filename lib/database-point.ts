import { PrismaClient } from './generated/prisma-point'

declare global {
  var prismaPoint: PrismaClient | undefined
}

export const prismaPoint = globalThis.prismaPoint || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaPoint = prismaPoint
}

export default prismaPoint
