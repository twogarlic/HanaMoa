import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const recurringOrders = await prisma.recurringOrder.findMany({
      where: { 
        userId: userId 
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      orders: recurringOrders
    })

  } catch (error) {
    return NextResponse.json(
      { error: '정기주문 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
    }
}
