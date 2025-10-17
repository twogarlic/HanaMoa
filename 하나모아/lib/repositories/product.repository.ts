import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class ProductRepository {
  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: {
              where: { isVisible: true }
            }
          }
        }
      }
    })
  }

  async findMany(options: {
    category?: string
    search?: string
    sortBy?: string
    skip?: number
    take?: number
  }) {
    const where: Prisma.ProductWhereInput = {
      isActive: true
    }

    if (options.category && options.category !== 'all') {
      where.category = options.category
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search } },
        { description: { contains: options.search } }
      ]
    }

    let orderBy: any = {}
    switch (options.sortBy) {
      case 'price':
        orderBy = { price: 'asc' }
        break
      case 'rating':
        orderBy = { reviews: { _count: 'desc' } }
        break
      case 'popularity':
      default:
        orderBy = { isPopular: 'desc' }
        break
    }

    return await prisma.product.findMany({
      where,
      orderBy,
      skip: options.skip,
      take: options.take,
      include: {
        reviews: {
          where: { isVisible: true },
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: {
              where: { isVisible: true }
            }
          }
        }
      }
    })
  }

  async count(category?: string, search?: string) {
    const where: Prisma.ProductWhereInput = {
      isActive: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    return await prisma.product.count({ where })
  }

  async updateStock(id: string, quantity: number) {
    return await prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity
        }
      }
    })
  }
}

export const productRepository = new ProductRepository()

