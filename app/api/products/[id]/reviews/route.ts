import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
        isVisible: true
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.productReview.count({
      where: {
        productId,
        isVisible: true
      }
    })

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return NextResponse.json({ error: '리뷰 조회에 실패했습니다.' }, { status: 500 })
    }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { userId, rating, content, images } = body

    if (!userId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '필수 정보가 누락되었거나 평점이 올바르지 않습니다.' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    const exchange = await prisma.productExchange.findFirst({
      where: {
        userId,
        productId,
        status: 'COMPLETED'
      }
    })

    if (!exchange) {
      return NextResponse.json({ error: '해당 상품을 구매한 사용자만 리뷰를 작성할 수 있습니다.' }, { status: 400 })
    }

    const existingReview = await prisma.productReview.findFirst({
      where: {
        userId,
        productId
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: '이미 리뷰를 작성하셨습니다.' }, { status: 400 })
    }

    const review = await prisma.productReview.create({
      data: {
        userId,
        productId,
        rating,
        content,
        images: images ? JSON.stringify(images) : null
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '리뷰가 작성되었습니다.',
      review
    })

  } catch (error) {
    return NextResponse.json({ error: '리뷰 작성에 실패했습니다.' }, { status: 500 })
    }
}
