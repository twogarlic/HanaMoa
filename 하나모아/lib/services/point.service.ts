import { pointRepository } from '@/lib/repositories/point.repository'
import { ValidationError, NotFoundError, ConflictError } from '@/lib/api/utils/errors'
import type { EarnPointInput, UsePointInput, LinkPointInput } from '@/lib/api/validators/point.schema'

export class PointService {
  async getBalance(userId: string) {
    const account = await pointRepository.findByUserId(userId)

    if (!account) {
      throw new NotFoundError('포인트 계정을 찾을 수 없습니다')
    }

    return { balance: account.balance }
  }

  async checkAccount(userId: string) {
    const account = await pointRepository.findByUserId(userId)
    return { exists: !!account, account }
  }

  async earnPoint(data: EarnPointInput) {
    const account = await pointRepository.findByUserId(data.userId)

    if (!account) {
      throw new NotFoundError('포인트 계정을 찾을 수 없습니다')
    }

    const updatedAccount = await pointRepository.updateBalance(data.userId, data.amount, 'increment')

    await pointRepository.createTransaction({
      userId: data.userId,
      type: 'EARN',
      amount: data.amount,
      balance: updatedAccount.balance,
      description: data.description
    })

    return updatedAccount
  }

  async usePoint(data: UsePointInput) {
    const account = await pointRepository.findByUserId(data.userId)

    if (!account) {
      throw new NotFoundError('포인트 계정을 찾을 수 없습니다')
    }

    if (account.balance < data.amount) {
      throw new ValidationError('포인트가 부족합니다')
    }

    const updatedAccount = await pointRepository.updateBalance(data.userId, data.amount, 'decrement')

    await pointRepository.createTransaction({
      userId: data.userId,
      type: 'USE',
      amount: -data.amount,
      balance: updatedAccount.balance,
      description: data.description
    })

    return updatedAccount
  }

  async linkAccount(data: LinkPointInput) {
    const existingByUserId = await pointRepository.findByUserId(data.userId)
    if (existingByUserId) {
      return {
        success: true,
        isNewAccount: false,
        message: '이미 연결된 포인트 계정이 있습니다',
        data: { balance: existingByUserId.balance }
      }
    }

    const existingBySSN = await pointRepository.findBySSN(data.ssn)
    if (existingBySSN) {
      throw new ConflictError('이미 등록된 주민등록번호입니다')
    }

    const newAccount = await pointRepository.create({
      userId: data.userId,
      name: data.name,
      ssn: data.ssn,
      phone: data.phone,
      balance: 0
    })

    return {
      success: true,
      isNewAccount: true,
      message: '포인트 계정이 생성되었습니다',
      data: { balance: newAccount.balance }
    }
  }

  async getHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      pointRepository.getTransactions(userId, skip, limit),
      pointRepository.countTransactions(userId)
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
}

export const pointService = new PointService()

