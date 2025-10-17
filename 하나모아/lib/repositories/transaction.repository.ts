import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class TransactionRepository {
  async findById(id: string) {
    return await prisma.transaction.findUnique({
      where: { id }
    })
  }

  async findByUserId(userId: string, options?: {
    type?: string
    skip?: number
    take?: number
  }) {
    const where: Prisma.TransactionWhereInput = { userId }

    if (options?.type) {
      where.type = options.type as any
    }

    return await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            accountName: true,
            accountNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: options?.skip,
      take: options?.take
    })
  }

  async findByAccountId(accountId: string, options?: {
    skip?: number
    take?: number
  }) {
    return await prisma.transaction.findMany({
      where: { accountId },
      orderBy: {
        createdAt: 'desc'
      },
      skip: options?.skip,
      take: options?.take
    })
  }

  async countByUserId(userId: string, type?: string) {
    const where: Prisma.TransactionWhereInput = { userId }

    if (type) {
      where.type = type as any
    }

    return await prisma.transaction.count({ where })
  }

  async create(data: Prisma.TransactionCreateInput) {
    return await prisma.transaction.create({
      data
    })
  }
}

export const transactionRepository = new TransactionRepository()

