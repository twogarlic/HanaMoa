import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class UserRepository {
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true
      }
    })
  }

  async findByUserId(userId: string) {
    return await prisma.user.findUnique({
      where: { userId },
      include: {
        accounts: true
      }
    })
  }

  async findByPhone(phone: string) {
    return await prisma.user.findUnique({
      where: { phone }
    })
  }

  async findBySSN(ssn: string) {
    return await prisma.user.findFirst({
      where: { ssn }
    })
  }

  async findByProviderInfo(provider: string, providerId: string) {
    return await prisma.user.findFirst({
      where: {
        provider,
        providerId
      }
    })
  }

  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
      include: {
        accounts: true
      }
    })
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }

  async incrementLoginFailCount(userId: string) {
    return await prisma.user.update({
      where: { userId },
      data: {
        loginFailCount: {
          increment: 1
        }
      }
    })
  }

  async lockAccount(userId: string, lockUntil: Date) {
    return await prisma.user.update({
      where: { userId },
      data: {
        isLocked: true,
        lockedUntil: lockUntil
      }
    })
  }

  async unlockAccount(userId: string) {
    return await prisma.user.update({
      where: { userId },
      data: {
        loginFailCount: 0,
        isLocked: false,
        lockedUntil: null
      }
    })
  }

  async resetLoginFailCount(userId: string) {
    return await prisma.user.update({
      where: { userId },
      data: {
        loginFailCount: 0
      }
    })
  }
}

export const userRepository = new UserRepository()

