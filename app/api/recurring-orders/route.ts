import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const where: any = { userId }
    
    if (status) {
      where.status = status.toUpperCase()
    }

    const recurringOrders = await prisma.recurringOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: recurringOrders
    })

  } catch (error) {
    return NextResponse.json(
      { error: '정기 주문 조회에 실패했습니다.' },
      { status: 500 }
    )
    }
}
