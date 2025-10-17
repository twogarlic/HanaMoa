import { transactionRepository } from '@/lib/repositories/transaction.repository'
import { accountRepository } from '@/lib/repositories/account.repository'
import { ValidationError } from '@/lib/api/utils/errors'
import prisma from '@/lib/database'

export class TransactionService {
  async getTransactions(userId: string, type?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      transactionRepository.findByUserId(userId, { type, skip, take: limit }),
      transactionRepository.countByUserId(userId, type)
    ])

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getAccountTransactions(accountId: string, userId: string, page: number = 1, limit: number = 20) {
    const account = await accountRepository.findById(accountId)

    if (!account) {
      throw new ValidationError('계좌를 찾을 수 없습니다')
    }

    if (account.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    const skip = (page - 1) * limit

    const transactions = await transactionRepository.findByAccountId(accountId, { skip, take: limit })

    return {
      transactions
    }
  }

  async deposit(userId: string, accountId: string, amount: number) {
    const account = await accountRepository.findById(accountId)

    if (!account) {
      throw new ValidationError('계좌를 찾을 수 없습니다')
    }

    if (account.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    if (amount <= 0) {
      throw new ValidationError('입금액은 0보다 커야 합니다')
    }

    const updatedAccount = await prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amount
          }
        }
      })

      await tx.transaction.create({
        data: {
          userId,
          accountId,
          type: 'DEPOSIT',
          amount,
          balance: updated.balance,
          description: '입금'
        }
      })

      return updated
    })

    return updatedAccount
  }
}

export const transactionService = new TransactionService()

