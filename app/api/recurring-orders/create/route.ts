import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import prismaPrice from '../../../../lib/database-price'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      asset, 
      orderType,
      quantity, 
      frequency, 
      startDate, 
      endDate 
    } = body

    if (!userId || !asset || !orderType || !quantity || !frequency || !startDate || !endDate) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: '수량은 0보다 커야 합니다.' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: '종료일은 시작일보다 늦어야 합니다.' },
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

    if (orderType === 'sell') {
      const holding = await prisma.holding.findFirst({
        where: {
          userId: userId,
          asset: asset
        }
      })

      if (!holding || holding.quantity < quantity) {
        return NextResponse.json(
          { error: '보유량이 부족합니다.' },
          { status: 400 }
        )
      }
    }

    if (orderType === 'buy') {
      const priceData = await prismaPrice.chartPrice.findFirst({
        where: { asset: asset },
        orderBy: { createdAt: 'desc' }
      })

      if (priceData) {
        const estimatedCost = quantity * priceData.price
        const account = await prisma.account.findFirst({
          where: { userId: userId }
        })
        
        if (account && account.balance < estimatedCost) {
          return NextResponse.json(
            { error: '잔액이 부족합니다.' },
            { status: 400 }
          )
        }
      }
    }

    const recurringOrder = await prisma.recurringOrder.create({
      data: {
        userId,
        asset,
        orderType: orderType.toUpperCase(),
        quantity,
        frequency: frequency.toUpperCase(),
        startDate: start,
        endDate: end,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      data: recurringOrder
    })

  } catch (error) {
    return NextResponse.json(
      { error: '정기 주문 생성에 실패했습니다.' },
      { status: 500 }
    )
    }
}
