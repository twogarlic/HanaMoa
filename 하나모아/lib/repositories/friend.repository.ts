import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class FriendRepository {
  async findByUserIdAndFriendId(userId: string, friendId: string) {
    return await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId,
          friendId
        }
      }
    })
  }

  async findAcceptedFriends(userId: string) {
    return await prisma.friend.findMany({
      where: {
        userId,
        isAccepted: true
      },
      select: {
        id: true,
        friendId: true,
        friendName: true,
        friendPhone: true,
        createdAt: true,
        friendUser: {
          select: {
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findPendingRequests(userId: string, type: 'sent' | 'received') {
    const where: Prisma.FriendRequestWhereInput = {
      isAccepted: false
    }

    if (type === 'sent') {
      where.requesterId = userId
    } else {
      where.receiverId = userId
    }

    return await prisma.friendRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
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

  async create(data: Prisma.FriendCreateInput) {
    return await prisma.friend.create({
      data
    })
  }

  async delete(userId: string, friendId: string) {
    return await prisma.friend.delete({
      where: {
        userId_friendId: {
          userId,
          friendId
        }
      }
    })
  }

  async createRequest(requesterId: string, receiverId: string) {
    return await prisma.friendRequest.create({
      data: {
        requesterId,
        receiverId
      }
    })
  }

  async findRequestById(id: string) {
    return await prisma.friendRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        receiver: true
      }
    })
  }

  async acceptRequest(id: string) {
    return await prisma.friendRequest.update({
      where: { id },
      data: {
        isAccepted: true,
        acceptedAt: new Date()
      }
    })
  }

  async deleteRequest(id: string) {
    return await prisma.friendRequest.delete({
      where: { id }
    })
  }
}

export const friendRepository = new FriendRepository()

