import { NextRequest, NextResponse } from 'next/server'
import { prismaPoint } from '@/lib/database-point'

/**
 * 하나머니(포인트) 잔액 조회 API
 * GET /api/points/balance?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const point = await prismaPoint.hanaPoint.findUnique({
      where: { userId }
    })
    
    if (!point) {
      return NextResponse.json({
        success: false,
        error: '하나머니 계정이 없습니다.'
      })
    }
    
    return NextResponse.json({
      success: true,
      balance: point.balance,
      totalEarned: point.totalEarned,
      totalUsed: point.totalUsed,
      createdAt: point.createdAt,
      updatedAt: point.updatedAt
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '포인트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prismaPoint.$disconnect()
  }
}
