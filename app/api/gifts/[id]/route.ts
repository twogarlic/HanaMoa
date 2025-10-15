import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, userId } = body 

    if (!action || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: '액션과 사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 액션입니다.' 
      }, { status: 400 })
    }

    const gift = await prisma.gift.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!gift) {
      return NextResponse.json({ 
        success: false, 
        error: '선물을 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    if (gift.receiverId !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: '권한이 없습니다.' 
      }, { status: 403 })
    }

    if (gift.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        error: '이미 처리된 선물입니다.' 
      }, { status: 409 })
    }

    if (action === 'accept') {
      await prisma.$transaction(async (tx) => {
        await tx.gift.update({
          where: { id },
          data: { 
            status: 'RECEIVED',
            receivedAt: new Date()
          }
        })

        const existingHolding = await tx.holding.findUnique({
          where: {
            userId_asset: {
              userId: gift.receiverId,
              asset: gift.asset,
            },
          },
        })
        
        if (existingHolding) {
          const newQuantity = Math.round((existingHolding.quantity + gift.quantity) * 100) / 100
          const newAveragePrice = Math.round((existingHolding.totalAmount / newQuantity) * 100) / 100
          
          await tx.holding.update({
            where: {
              userId_asset: {
                userId: gift.receiverId,
                asset: gift.asset,
              },
            },
            data: {
              quantity: newQuantity,
              averagePrice: newAveragePrice,
            },
          })
        } else {
          await tx.holding.create({
            data: {
              userId: gift.receiverId,
              asset: gift.asset,
              quantity: gift.quantity,
              averagePrice: 0, 
              totalAmount: 0, 
            },
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: '선물을 수락했습니다.'
      })
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.gift.update({
          where: { id },
          data: { status: 'DECLINED' }
        })

        const senderHolding = await tx.holding.findUnique({
          where: {
            userId_asset: {
              userId: gift.senderId,
              asset: gift.asset,
            },
          },
        })
        
        if (senderHolding) {
          const newQuantity = Math.round((senderHolding.quantity + gift.quantity) * 100) / 100
          const newTotalAmount = Math.round((newQuantity * senderHolding.averagePrice) * 100) / 100
          
          await tx.holding.update({
            where: {
              userId_asset: {
                userId: gift.senderId,
                asset: gift.asset,
              },
            },
            data: {
              quantity: newQuantity,
              totalAmount: newTotalAmount
            }
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: '선물을 거절했습니다.'
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '선물 처리에 실패했습니다.' },
      { status: 500 }
    )
    }
}
