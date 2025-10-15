import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, userId } = body

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: '주문 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const recurringOrder = await prisma.recurringOrder.findFirst({
      where: { 
        id: orderId,
        userId: userId
      }
    })

    if (!recurringOrder) {
      return NextResponse.json(
        { error: '정기주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.recurringOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({
      success: true,
      message: '정기주문이 성공적으로 취소되었습니다.'
    })

  } catch (error) {
    return NextResponse.json(
      { error: '정기주문 취소에 실패했습니다.' },
      { status: 500 }
    )
    }
}
