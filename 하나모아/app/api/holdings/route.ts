import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'
import prismaPrice from '../../../lib/database-price'

async function getHoldings(userId: string): Promise<{ success: boolean; holdings?: any[]; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true } 
    })
    
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }
    
    const holdings = await prisma.holding.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
    
    const realTimePrices = await prismaPrice.realTimePrice.findMany({
      where: {
        asset: { in: holdings.map(h => h.asset) }
      }
    })
    
    const holdingsWithPrices = holdings.map(holding => {
      const realTimePrice = realTimePrices.find(rtp => rtp.asset === holding.asset)
      const currentPrice = realTimePrice?.currentPrice || 0
      const currentValue = currentPrice * holding.quantity
      const profitLoss = currentValue - holding.totalAmount
      const profitLossRatio = holding.totalAmount > 0 ? (profitLoss / holding.totalAmount) * 100 : 0
      
      return {
        ...holding,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossRatio,
        isUp: realTimePrice?.isUp || 0
      }
    })
    
    return { success: true, holdings: holdingsWithPrices }
    
  } catch (error) {
    return { success: false, error: '보유 자산 조회 중 오류가 발생했습니다.' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const result = await getHoldings(userId)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        holdings: result.holdings
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
