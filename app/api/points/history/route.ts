import { NextRequest, NextResponse } from 'next/server'
import { prismaPoint } from '@/lib/database-point'

/**
 * 하나머니(포인트) 히스토리 조회 API
 * GET /api/points/history?userId=xxx&limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') 
    
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
        success: true,
        data: {
          balance: 0,
          histories: [],
          total: 0
        }
      })
    }
    
    const whereCondition: any = {
      pointId: point.id
    }
    
    if (type) {
      whereCondition.type = type
    }
    
    const [histories, total] = await Promise.all([
      prismaPoint.hanaPointHistory.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          description: true,
          sourceSystem: true,
          sourceId: true,
          expiresAt: true,
          createdAt: true
        }
      }),
      prismaPoint.hanaPointHistory.count({
        where: whereCondition
      })
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        balance: point.balance,
        totalEarned: point.totalEarned,
        totalUsed: point.totalUsed,
        histories,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '히스토리 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prismaPoint.$disconnect()
  }
}
