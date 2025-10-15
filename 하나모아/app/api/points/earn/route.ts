import { NextRequest, NextResponse } from 'next/server'
import { prismaPoint } from '@/lib/database-point'

/**
 * 하나머니(포인트) 적립 API
 * POST /api/points/earn
 * Body: { userId, amount, description?, sourceId? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, description, sourceId } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      )
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: '적립 금액은 0보다 커야 합니다.' },
        { status: 400 }
      )
    }
    
    const result = await prismaPoint.$transaction(async (tx) => {
      let point = await tx.hanaPoint.findUnique({
        where: { userId }
      })
      
      if (!point) {
        point = await tx.hanaPoint.create({
          data: {
            userId,
            balance: 0,
            totalEarned: 0,
            totalUsed: 0
          }
        })
      }
      
      const newBalance = point.balance + amount
      
      const updatedPoint = await tx.hanaPoint.update({
        where: { id: point.id },
        data: {
          balance: newBalance,
          totalEarned: { increment: amount }
        }
      })
      
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      
      await tx.hanaPointHistory.create({
        data: {
          pointId: point.id,
          type: 'EARN',
          amount,
          balance: newBalance,
          description: description || '하나머니 적립',
          sourceSystem: 'hana-moai',
          sourceId: sourceId || null,
          expiresAt
        }
      })
      
      return {
        balance: updatedPoint.balance,
        totalEarned: updatedPoint.totalEarned,
        earned: amount
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${amount}P가 적립되었습니다.`,
      data: result
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '포인트 적립 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prismaPoint.$disconnect()
  }
}
