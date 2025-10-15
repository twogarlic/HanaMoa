import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

async function getOrders(
  userId: string, 
  limit: number = 50, 
  offset: number = 0,
  asset?: string,
  status?: string
): Promise<{ success: boolean; orders?: any[]; total?: number; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true } 
    })
    
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }
    
    const where: any = { userId }
    if (asset) where.asset = asset
    if (status) where.status = status
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          executions: true,
          account: { select: { accountName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.order.count({ where })
    ])
    
    return { success: true, orders, total }
    
  } catch (error) {
    return { success: false, error: '주문 내역 조회 중 오류가 발생했습니다.' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const asset = searchParams.get('asset') || undefined
    const status = searchParams.get('status') || undefined
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const result = await getOrders(userId, limit, offset, asset, status)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        orders: result.orders,
        total: result.total,
        limit,
        offset
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
