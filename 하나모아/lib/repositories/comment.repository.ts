import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class CommentRepository {
  async findByPostId(postId: string) {
    return await prisma.comment.findMany({
      where: {
        postId,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        replies: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async create(data: Prisma.CommentCreateInput) {
    return await prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })
  }

  async delete(id: string) {
    return await prisma.comment.update({
      where: { id },
      data: { isDeleted: true }
    })
  }
}

export const commentRepository = new CommentRepository()

