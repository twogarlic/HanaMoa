import { coinboxRepository } from '@/lib/repositories/coinbox.repository'
import { holdingRepository } from '@/lib/repositories/holding.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import prisma from '@/lib/database'
import type { CreateCoinboxInput } from '@/lib/api/validators/coinbox.schema'

export class CoinboxService {
  async getCoinboxes(userId: string) {
    return await coinboxRepository.findByUserId(userId)
  }

  async createCoinbox(data: CreateCoinboxInput) {
    return await coinboxRepository.create({
      user: { connect: { id: data.userId } },
      targetAmount: data.targetAmount,
      dailyAmount: data.dailyAmount,
      currentAmount: 0,
      asset: data.asset,
      isActive: true,
      lastCollectedAt: null
    })
  }

  async toggleCoinbox(coinboxId: string, userId: string) {
    const coinbox = await coinboxRepository.findById(coinboxId)

    if (!coinbox) {
      throw new NotFoundError('저금통을 찾을 수 없습니다')
    }

    if (coinbox.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    return await coinboxRepository.toggleActive(coinboxId)
  }

  async emptyCoinbox(coinboxId: string, userId: string) {
    const coinbox = await coinboxRepository.findById(coinboxId)

    if (!coinbox) {
      throw new NotFoundError('저금통을 찾을 수 없습니다')
    }

    if (coinbox.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    if (coinbox.currentAmount <= 0) {
      throw new ValidationError('비어있는 저금통입니다')
    }

    await prisma.$transaction(async (tx) => {
      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_asset: {
            userId,
            asset: coinbox.asset
          }
        }
      })

      if (existingHolding) {
        await tx.holding.update({
          where: {
            userId_asset: {
              userId,
              asset: coinbox.asset
            }
          },
          data: {
            quantity: {
              increment: coinbox.currentAmount
            }
          }
        })
      } else {
        await tx.holding.create({
          data: {
            userId,
            asset: coinbox.asset,
            quantity: coinbox.currentAmount,
            averagePrice: 0,
            totalAmount: 0
          }
        })
      }

      await tx.coinbox.update({
        where: { id: coinboxId },
        data: {
          currentAmount: 0,
          lastEmptiedAt: new Date()
        }
      })
    })

    return { message: '저금통이 비워졌습니다' }
  }
}

export const coinboxService = new CoinboxService()

