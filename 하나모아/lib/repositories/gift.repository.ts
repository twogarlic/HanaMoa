import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class GiftRepository {
  async findById(id: string) {
    return await prisma.gift.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            name: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    })
  }

  async findByUserId(userId: string, type?: 'sent' | 'received') {
    const where: Prisma.GiftWhereInput = {}

    if (type === 'sent') {
      where.senderId = userId
    } else if (type === 'received') {
      where.receiverId = userId
    } else {
      where.OR = [
        { senderId: userId },
        { receiverId: userId }
      ]
    }

    return await prisma.gift.findMany({
      where,
      include: {
        sender: {
          select: {
            name: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async create(data: Prisma.GiftCreateInput) {
    return await prisma.gift.create({
      data
    })
  }

  async update(id: string, data: Prisma.GiftUpdateInput) {
    return await prisma.gift.update({
      where: { id },
      data
    })
  }

  async findPendingGiftById(id: string) {
    return await prisma.pendingGift.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    })
  }

  async findPendingGiftsByPhone(phone: string) {
    return await prisma.pendingGift.findMany({
      where: {
        receiverPhone: phone,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        sender: {
          select: {
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async createPendingGift(data: Prisma.PendingGiftCreateInput) {
    return await prisma.pendingGift.create({
      data
    })
  }

  async updatePendingGift(id: string, data: Prisma.PendingGiftUpdateInput) {
    return await prisma.pendingGift.update({
      where: { id },
      data
    })
  }

  async deletePendingGift(id: string) {
    return await prisma.pendingGift.delete({
      where: { id }
    })
  }
}

export const giftRepository = new GiftRepository()

