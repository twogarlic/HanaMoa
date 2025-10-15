import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

async function cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      }
    })
    
    if (!order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }
    
    if (order.status === 'COMPLETED') {
      return { success: false, error: '이미 체결된 주문은 취소할 수 없습니다.' }
    }
    
    if (order.status === 'CANCELLED') {
      return { success: false, error: '이미 취소된 주문입니다.' }
    }
    
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    })
    
    return { success: true }
    
  } catch (error) {
    return { success: false, error: '주문 취소 중 오류가 발생했습니다.' }
    }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, userId } = body
    
    if (!orderId || !userId) {
      return NextResponse.json({
        success: false,
        error: '주문 ID와 사용자 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const result = await cancelOrder(orderId, userId)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '주문이 성공적으로 취소되었습니다.'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
