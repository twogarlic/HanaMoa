import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class GoalRepository {
  async findById(id: string) {
    return await prisma.goal.findUnique({
      where: { id }
    })
  }

  async findByUserId(userId: string, status?: string) {
    const where: Prisma.GoalWhereInput = { userId }
    
    if (status) {
      where.status = status as any
    }

    return await prisma.goal.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async create(data: Prisma.GoalCreateInput) {
    return await prisma.goal.create({
      data
    })
  }

  async update(id: string, data: Prisma.GoalUpdateInput) {
    return await prisma.goal.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return await prisma.goal.delete({
      where: { id }
    })
  }

  async updateProgress(id: string, currentAmount: number) {
    return await prisma.goal.update({
      where: { id },
      data: {
        currentAmount,
        updatedAt: new Date()
      }
    })
  }
}

export const goalRepository = new GoalRepository()

