import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class PostRepository {
  async findById(id: string) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true
          }
        },
        poll: {
          include: {
            options: true
          }
        },
        _count: {
          select: {
            commentList: { where: { isDeleted: false } },
            likeList: true
          }
        }
      }
    })
  }

  async findMany(options: {
    asset?: string
    sortBy?: string
    skip?: number
    take?: number
  }) {
    const where: Prisma.PostWhereInput = {
      isDeleted: false
    }

    if (options.asset) {
      where.asset = options.asset
    }

    const orderBy = options.sortBy === 'popular'
      ? [{ likes: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }]

    return await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true
          }
        },
        poll: {
          include: {
            options: true
          }
        },
        _count: {
          select: {
            commentList: { where: { isDeleted: false } },
            likeList: true
          }
        }
      },
      orderBy,
      skip: options.skip,
      take: options.take
    })
  }

  async count(asset?: string) {
    const where: Prisma.PostWhereInput = {
      isDeleted: false
    }

    if (asset) {
      where.asset = asset
    }

    return await prisma.post.count({ where })
  }

  async create(data: Prisma.PostCreateInput) {
    return await prisma.post.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true
          }
        }
      }
    })
  }

  async update(id: string, data: Prisma.PostUpdateInput) {
    return await prisma.post.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return await prisma.post.update({
      where: { id },
      data: { isDeleted: true }
    })
  }

  async likePost(postId: string, userId: string) {
    return await prisma.postLike.create({
      data: {
        postId,
        userId
      }
    })
  }

  async unlikePost(postId: string, userId: string) {
    return await prisma.postLike.delete({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    })
  }

  async isLiked(postId: string, userId: string) {
    const like = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    })
    return !!like
  }
}

export const postRepository = new PostRepository()

