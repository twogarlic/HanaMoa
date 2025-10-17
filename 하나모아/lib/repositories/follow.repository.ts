import prisma from '@/lib/database'

export class FollowRepository {
  async isFollowing(followerId: string, followingId: string) {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })
    return !!follow
  }

  async follow(followerId: string, followingId: string) {
    return await prisma.userFollow.create({
      data: {
        followerId,
        followingId
      }
    })
  }

  async unfollow(followerId: string, followingId: string) {
    return await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })
  }

  async getFollowers(userId: string) {
    return await prisma.userFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })
  }

  async getFollowing(userId: string) {
    return await prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })
  }
}

export const followRepository = new FollowRepository()

