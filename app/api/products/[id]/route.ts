import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    const reviews = product.reviews
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product._count.reviews
      }
    })

  } catch (error) {
    return NextResponse.json({ error: '상품 조회에 실패했습니다.' }, { status: 500 })
    }
}
