import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'popularity'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isActive: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    let orderBy: any = {}
    switch (sortBy) {
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.product.count({ where })
    ])

    const productsWithRating = products.map(product => {
      const reviews = product.reviews
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0
      
      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product._count.reviews
      }
    })

    return NextResponse.json({
      success: true,
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return NextResponse.json({ error: '상품 조회에 실패했습니다.' }, { status: 500 })
  }
}
