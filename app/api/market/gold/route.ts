import { NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    
    if (page) {
      const pageNum = parseInt(page)
      const pageSize = 10
      const skip = (pageNum - 1) * pageSize
      
      const dailyPrices = await prismaPrice.dailyPrice.findMany({
        where: { asset: 'gold' },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize
      })
      
      return NextResponse.json({ 
        success: true, 
        data: dailyPrices.map(price => ({
          date: price.date,
          close: price.close,
          diff: price.diff,
          ratio: price.ratio
        }))
      })
    } else {
      const realTimePrice = await prismaPrice.realTimePrice.findUnique({
        where: { asset: 'gold' }
      })
      
      if (!realTimePrice) {
        return NextResponse.json({
          error: '금 가격 정보를 찾을 수 없습니다.'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        type: 'gold',
        round: realTimePrice.round,
        time: realTimePrice.time,
        currentPrice: realTimePrice.currentPrice,
        changeValue: realTimePrice.changeValue,
        changeRatio: realTimePrice.changeRatio,
        isUp: realTimePrice.isUp,
        lastUpdated: realTimePrice.updatedAt.toISOString()
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: '금 가격 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
