import { PrismaClient } from './generated/prisma-price'

declare global {
  var prismaPrice: PrismaClient | undefined
}

let prismaPrice: PrismaClient

try {
  prismaPrice = globalThis.prismaPrice || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaPrice = prismaPrice
  }
} catch (error) {
  throw error
}

export { prismaPrice }
export default prismaPrice


