import { NextRequest, NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    let targetDateStr: string
    if (dateParam) {
      targetDateStr = dateParam 
    } else {
      const today = new Date()
      targetDateStr = today.toISOString().split('T')[0].replace(/-/g, '') 
    }
    
    const chartPrices = await prismaPrice.chartPrice.findMany({
      where: { 
        asset: 'usd',
        dateTime: {
          startsWith: targetDateStr
        }
      },
      orderBy: { degreeCount: 'asc' } 
    })

    if (chartPrices.length === 0) {
      return NextResponse.json({
        isSuccess: false,
        detailCode: "NO_DATA",
        message: "USD 회차 차트 데이터가 없습니다.",
        result: null
      }, { status: 404 })
    }

    const realTimePrice = await prismaPrice.realTimePrice.findUnique({
      where: { asset: 'usd' }
    })

    const prices = chartPrices.map(p => p.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    const result = {
      code: "CMDT_USD",
      infoType: "marketindex",
      periodType: "day",
      openPrice: chartPrices[chartPrices.length - 1]?.price || 0, 
      lastClosePrice: chartPrices[0]?.price || 0, 
      tradeBaseAt: realTimePrice?.rawDateTime?.substring(0, 8) || new Date().toISOString().split('T')[0].replace(/-/g, ''),
      lastTradeBaseAt: chartPrices[chartPrices.length - 1]?.dateTime?.substring(0, 8) || new Date().toISOString().split('T')[0].replace(/-/g, ''),
      localDateTimeNow: realTimePrice?.rawDateTime || new Date().toISOString().replace(/[T:-]/g, '').substring(0, 14),
      priceInfos: chartPrices.map(price => ({
        localDateTime: price.dateTime,
        currentPrice: price.price,
        degreeCount: price.degreeCount.toString()
      }))
    }

    return NextResponse.json({
      isSuccess: true,
      detailCode: "",
      message: "",
      result
    })

  } catch (error) {
    
    return NextResponse.json({
      isSuccess: false,
      detailCode: "ERROR",
      message: error instanceof Error ? error.message : "USD 회차 차트 데이터 조회 중 오류가 발생했습니다.",
      result: null
    }, { status: 500 })
  } finally {
    await prismaPrice.$disconnect()
  }
}
