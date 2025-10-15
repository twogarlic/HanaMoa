import { NextRequest, NextResponse } from 'next/server'
import { prismaPoint } from '@/lib/database-point'

/**
 * 하나머니(포인트) 사용 API
 * POST /api/points/use
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
        { success: false, error: '사용 금액은 0보다 커야 합니다.' },
        { status: 400 }
      )
    }
    
    const result = await prismaPoint.$transaction(async (tx) => {
      const point = await tx.hanaPoint.findUnique({
        where: { userId }
      })
      
      if (!point) {
        throw new Error('포인트 계정이 존재하지 않습니다.')
      }
      
      if (point.balance < amount) {
        throw new Error(`포인트가 부족합니다. (보유: ${point.balance}P, 필요: ${amount}P)`)
      }
      
      const newBalance = point.balance - amount
      
      const updatedPoint = await tx.hanaPoint.update({
        where: { id: point.id },
        data: {
          balance: newBalance,
          totalUsed: { increment: amount }
        }
      })
      
      await tx.hanaPointHistory.create({
        data: {
          pointId: point.id,
          type: 'USE',
          amount: -amount, 
          balance: newBalance,
          description: description || '하나머니 사용',
          sourceSystem: 'hana-moai',
          sourceId: sourceId || null
        }
      })
      
      return {
        balance: updatedPoint.balance,
        totalUsed: updatedPoint.totalUsed,
        used: amount
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${amount}P를 사용했습니다.`,
      data: result
    })
    
  } catch (error: any) {
    
    if (error.message && (error.message.includes('포인트가 부족') || error.message.includes('존재하지 않습니다'))) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: '포인트 사용 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prismaPoint.$disconnect()
  }
}
