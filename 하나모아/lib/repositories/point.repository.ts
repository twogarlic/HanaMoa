import prismaPoint from '@/lib/database-point'

export class PointRepository {
  async findByUserId(userId: string) {
    return await prismaPoint.pointAccount.findUnique({
      where: { userId }
    })
  }

  async findBySSN(ssn: string) {
    return await prismaPoint.pointAccount.findUnique({
      where: { ssn }
    })
  }

  async create(data: any) {
    return await prismaPoint.pointAccount.create({
      data
    })
  }

  async updateBalance(userId: string, amount: number, operation: 'increment' | 'decrement') {
    return await prismaPoint.pointAccount.update({
      where: { userId },
      data: {
        balance: {
          [operation]: amount
        }
      }
    })
  }

  async createTransaction(data: any) {
    return await prismaPoint.pointTransaction.create({
      data
    })
  }

  async getTransactions(userId: string, skip?: number, take?: number) {
    return await prismaPoint.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    })
  }

  async countTransactions(userId: string) {
    return await prismaPoint.pointTransaction.count({
      where: { userId }
    })
  }
}

export const pointRepository = new PointRepository()

