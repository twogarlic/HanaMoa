import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class HoldingRepository {
  async findByUserIdAndAsset(userId: string, asset: string) {
    return await prisma.holding.findUnique({
      where: {
        userId_asset: {
          userId,
          asset
        }
      }
    })
  }

  async findByUserId(userId: string) {
    return await prisma.holding.findMany({
      where: { userId },
      orderBy: { totalAmount: 'desc' }
    })
  }

  async create(data: Prisma.HoldingCreateInput) {
    return await prisma.holding.create({
      data
    })
  }

  async update(userId: string, asset: string, data: Prisma.HoldingUpdateInput) {
    return await prisma.holding.update({
      where: {
        userId_asset: {
          userId,
          asset
        }
      },
      data
    })
  }

  async delete(userId: string, asset: string) {
    return await prisma.holding.delete({
      where: {
        userId_asset: {
          userId,
          asset
        }
      }
    })
  }

  async incrementQuantity(userId: string, asset: string, quantity: number) {
    return await prisma.holding.update({
      where: {
        userId_asset: {
          userId,
          asset
        }
      },
      data: {
        quantity: {
          increment: quantity
        }
      }
    })
  }

  async decrementQuantity(userId: string, asset: string, quantity: number) {
    return await prisma.holding.update({
      where: {
        userId_asset: {
          userId,
          asset
        }
      },
      data: {
        quantity: {
          decrement: quantity
        }
      }
    })
  }
}

export const holdingRepository = new HoldingRepository()

