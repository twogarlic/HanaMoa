import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class CoinboxRepository {
  async findById(id: string) {
    return await prisma.coinbox.findUnique({
      where: { id }
    })
  }

  async findByUserId(userId: string) {
    return await prisma.coinbox.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findActiveByUserId(userId: string) {
    return await prisma.coinbox.findMany({
      where: {
        userId,
        isActive: true
      }
    })
  }

  async create(data: Prisma.CoinboxCreateInput) {
    return await prisma.coinbox.create({
      data
    })
  }

  async update(id: string, data: Prisma.CoinboxUpdateInput) {
    return await prisma.coinbox.update({
      where: { id },
      data
    })
  }

  async toggleActive(id: string) {
    const coinbox = await this.findById(id)
    return await prisma.coinbox.update({
      where: { id },
      data: {
        isActive: !coinbox?.isActive
      }
    })
  }
}

export const coinboxRepository = new CoinboxRepository()

