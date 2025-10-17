import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class OrderRepository {
  async findById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        executions: true,
        user: { select: { name: true } },
        account: { select: { accountName: true } }
      }
    })
  }

  async findByUserId(userId: string, options?: {
    status?: string
    asset?: string
    skip?: number
    take?: number
  }) {
    const where: Prisma.OrderWhereInput = { userId }
    
    if (options?.status) {
      where.status = options.status as any
    }
    
    if (options?.asset) {
      where.asset = options.asset
    }

    return await prisma.order.findMany({
      where,
      include: {
        executions: true,
        account: { select: { accountName: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take
    })
  }

  async countByUserId(userId: string, status?: string, asset?: string) {
    const where: Prisma.OrderWhereInput = { userId }
    
    if (status) {
      where.status = status as any
    }
    
    if (asset) {
      where.asset = asset
    }

    return await prisma.order.count({ where })
  }

  async create(data: Prisma.OrderCreateInput) {
    return await prisma.order.create({
      data,
      include: {
        executions: true,
        user: { select: { name: true } },
        account: { select: { accountName: true } }
      }
    })
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    return await prisma.order.update({
      where: { id },
      data,
      include: {
        executions: true,
        user: { select: { name: true } },
        account: { select: { accountName: true } }
      }
    })
  }

  async cancel(id: string) {
    return await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
  }

  async findPendingOrders() {
    return await prisma.order.findMany({
      where: {
        status: 'PENDING',
        priceType: 'limit'
      },
      include: {
        user: true,
        account: true
      }
    })
  }
}

export const orderRepository = new OrderRepository()

