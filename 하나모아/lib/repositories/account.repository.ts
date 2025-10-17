import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class AccountRepository {
  async findById(id: string) {
    return await prisma.account.findUnique({
      where: { id }
    })
  }

  async findByAccountNumber(accountNumber: string) {
    return await prisma.account.findUnique({
      where: { accountNumber }
    })
  }

  async findByUserId(userId: string) {
    return await prisma.account.findMany({
      where: { userId }
    })
  }

  async create(data: Prisma.AccountCreateInput) {
    return await prisma.account.create({
      data
    })
  }

  async update(id: string, data: Prisma.AccountUpdateInput) {
    return await prisma.account.update({
      where: { id },
      data
    })
  }

  async updateBalance(id: string, amount: number, operation: 'increment' | 'decrement') {
    return await prisma.account.update({
      where: { id },
      data: {
        balance: {
          [operation]: amount
        }
      }
    })
  }

  async linkToUser(accountId: string, userId: string) {
    return await prisma.account.update({
      where: { id: accountId },
      data: { userId }
    })
  }
}

export const accountRepository = new AccountRepository()

