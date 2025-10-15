import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const asset = searchParams.get('asset')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    if (asset) {
      const holding = await prisma.holding.findUnique({
        where: { userId_asset: { userId, asset } }
      })
      
      return NextResponse.json({
        success: true,
        holding: holding ? {
          ...holding,
          quantity: roundToTwoDecimals(holding.quantity),
          averagePrice: roundToTwoDecimals(holding.averagePrice),
          totalAmount: roundToTwoDecimals(holding.totalAmount)
        } : { quantity: 0, averagePrice: 0, totalAmount: 0 }
      })
    }
    
    const holdings = await prisma.holding.findMany({
      where: { userId },
      select: {
        asset: true,
        quantity: true,
        averagePrice: true,
        totalAmount: true
      }
    })
    
    const roundedHoldings = holdings.map(holding => ({
      ...holding,
      quantity: roundToTwoDecimals(holding.quantity),
      averagePrice: roundToTwoDecimals(holding.averagePrice),
      totalAmount: roundToTwoDecimals(holding.totalAmount)
    }))
    
    return NextResponse.json({
      success: true,
      holdings: roundedHoldings
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '보유 자산 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
