import { giftRepository } from '@/lib/repositories/gift.repository'
import { holdingRepository } from '@/lib/repositories/holding.repository'
import { accountRepository } from '@/lib/repositories/account.repository'
import { userRepository } from '@/lib/repositories/user.repository'
import prisma from '@/lib/database'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import type { SendPendingGiftInput, GiftActionInput } from '@/lib/api/validators/gift.schema'

export class GiftService {
  async sendPendingGift(data: SendPendingGiftInput) {
    const sender = await userRepository.findById(data.senderId)

    if (!sender) {
      throw new NotFoundError('발신자를 찾을 수 없습니다')
    }

    const holding = await holdingRepository.findByUserIdAndAsset(data.senderId, data.asset)

    if (!holding || holding.quantity < data.quantity) {
      throw new ValidationError('보유 자산이 부족합니다')
    }

    const normalizedPhone = data.receiverPhone.replace(/[^0-9]/g, '')

    const result = await prisma.$transaction(async (tx) => {
      const newQuantity = Math.round((holding.quantity - data.quantity) * 100) / 100
      const newTotalAmount = Math.round((newQuantity * holding.averagePrice) * 100) / 100

      await tx.holding.update({
        where: {
          userId_asset: {
            userId: data.senderId,
            asset: data.asset
          }
        },
        data: {
          quantity: newQuantity,
          totalAmount: newTotalAmount
        }
      })

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const pendingGift = await tx.pendingGift.create({
        data: {
          senderId: data.senderId,
          receiverPhone: normalizedPhone,
          receiverName: data.receiverName,
          asset: data.asset,
          quantity: data.quantity,
          messageCard: data.messageCard,
          message: data.message,
          expiresAt
        }
      })

      const senderAccount = await tx.account.findFirst({
        where: { userId: data.senderId }
      })

      if (senderAccount) {
        await tx.transaction.create({
          data: {
            userId: data.senderId,
            accountId: senderAccount.id,
            type: 'GIFT_SEND',
            amount: 0,
            balance: senderAccount.balance,
            description: `${data.asset.toUpperCase()} ${data.quantity}g 선물 (미가입자: ${normalizedPhone})`,
            referenceId: pendingGift.id
          }
        })
      }

      return pendingGift
    })

    await this.sendSMS(normalizedPhone, sender.name, data.asset, data.quantity, result.id)

    return result
  }

  async getPendingGifts(phone: string) {
    const normalizedPhone = phone.replace(/[^0-9]/g, '')
    return await giftRepository.findPendingGiftsByPhone(normalizedPhone)
  }

  async getGifts(userId: string, type?: 'sent' | 'received') {
    return await giftRepository.findByUserId(userId, type)
  }

  async handleGiftAction(giftId: string, data: GiftActionInput) {
    const gift = await giftRepository.findById(giftId)

    if (!gift) {
      throw new NotFoundError('선물을 찾을 수 없습니다')
    }

    if (gift.receiverId !== data.userId) {
      throw new ValidationError('권한이 없습니다')
    }

    if (gift.status !== 'PENDING') {
      throw new ValidationError('이미 처리된 선물입니다')
    }

    if (data.action === 'accept') {
      await this.acceptGift(giftId, data.userId)
      return { message: '선물을 수락했습니다' }
    } else {
      await this.declineGift(giftId)
      return { message: '선물을 거절했습니다' }
    }
  }

  private async acceptGift(giftId: string, userId: string) {
    const gift = await giftRepository.findById(giftId)

    if (!gift) {
      throw new NotFoundError('선물을 찾을 수 없습니다')
    }

    await prisma.$transaction(async (tx) => {
      await tx.gift.update({
        where: { id: giftId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date()
        }
      })

      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_asset: {
            userId,
            asset: gift.asset
          }
        }
      })

      if (existingHolding) {
        const newQuantity = Math.round((existingHolding.quantity + gift.quantity) * 100) / 100
        const newTotalAmount = Math.round((existingHolding.totalAmount + (gift.quantity * existingHolding.averagePrice)) * 100) / 100

        await tx.holding.update({
          where: {
            userId_asset: {
              userId,
              asset: gift.asset
            }
          },
          data: {
            quantity: newQuantity,
            totalAmount: newTotalAmount
          }
        })
      } else {
        await tx.holding.create({
          data: {
            userId,
            asset: gift.asset,
            quantity: gift.quantity,
            averagePrice: 0,
            totalAmount: 0
          }
        })
      }

      const receiverAccount = await tx.account.findFirst({
        where: { userId }
      })

      if (receiverAccount) {
        await tx.transaction.create({
          data: {
            userId,
            accountId: receiverAccount.id,
            type: 'GIFT_RECEIVE',
            amount: 0,
            balance: receiverAccount.balance,
            description: `${gift.asset.toUpperCase()} ${gift.quantity}g 선물 수령`,
            referenceId: giftId
          }
        })
      }
    })
  }

  private async declineGift(giftId: string) {
    const gift = await giftRepository.findById(giftId)

    if (!gift) {
      throw new NotFoundError('선물을 찾을 수 없습니다')
    }

    await prisma.$transaction(async (tx) => {
      await tx.gift.update({
        where: { id: giftId },
        data: {
          status: 'DECLINED',
          declinedAt: new Date()
        }
      })

      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_asset: {
            userId: gift.senderId,
            asset: gift.asset
          }
        }
      })

      if (existingHolding) {
        const newQuantity = Math.round((existingHolding.quantity + gift.quantity) * 100) / 100
        const newTotalAmount = Math.round((existingHolding.totalAmount + (gift.quantity * existingHolding.averagePrice)) * 100) / 100

        await tx.holding.update({
          where: {
            userId_asset: {
              userId: gift.senderId,
              asset: gift.asset
            }
          },
          data: {
            quantity: newQuantity,
            totalAmount: newTotalAmount
          }
        })
      }
    })
  }

  private async sendSMS(phone: string, senderName: string, asset: string, quantity: number, giftId: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sms/pending-gift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          senderName,
          asset,
          quantity
        })
      })

      if (response.ok) {
        await giftRepository.updatePendingGift(giftId, {
          smsStatus: 'SENT',
          smsSentAt: new Date()
        })
      } else {
        await giftRepository.updatePendingGift(giftId, {
          smsStatus: 'FAILED'
        })
      }
    } catch (error) {
      await giftRepository.updatePendingGift(giftId, {
        smsStatus: 'FAILED'
      })
    }
  }
}

export const giftService = new GiftService()

