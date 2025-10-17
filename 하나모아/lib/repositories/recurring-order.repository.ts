import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class RecurringOrderRepository {
  async findById(id: string) {
    return await prisma.recurringOrder.findUnique({
      where: { id }
    })
  }

  async findByUserId(userId: string, status?: string) {
    const where: Prisma.RecurringOrderWhereInput = { userId }

    if (status) {
      where.status = status as any
    }

    return await prisma.recurringOrder.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async create(data: Prisma.RecurringOrderCreateInput) {
    return await prisma.recurringOrder.create({
      data
    })
  }

  async update(id: string, data: Prisma.RecurringOrderUpdateInput) {
    return await prisma.recurringOrder.update({
      where: { id },
      data
    })
  }

  async cancel(id: string) {
    return await prisma.recurringOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
  }

  async findActiveOrders() {
    return await prisma.recurringOrder.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    })
  }
}

export const recurringOrderRepository = new RecurringOrderRepository()

