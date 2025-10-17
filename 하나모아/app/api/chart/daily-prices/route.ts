import { NextRequest, NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

type AssetType = 'gold' | 'silver' | 'usd' | 'jpy' | 'eur' | 'cny'
type Timeframe = '일' | '주' | '월' | '년'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asset = searchParams.get('asset') as AssetType
    const timeframe = searchParams.get('timeframe') as Timeframe

    if (!asset || !timeframe) {
      return NextResponse.json({ 
        success: false, 
        message: 'asset과 timeframe 파라미터가 필요합니다.' 
      }, { status: 400 })
    }

    const supportedAssets: AssetType[] = ['gold', 'silver', 'usd', 'jpy', 'eur', 'cny']
    if (!supportedAssets.includes(asset)) {
      return NextResponse.json({ 
        success: false, 
        message: '지원하지 않는 자산입니다.' 
      }, { status: 400 })
    }

    let dailyPrices: any[]
    
    if (timeframe === '년') {
      dailyPrices = await prismaPrice.dailyPrice.findMany({
        where: {
          asset: asset,
          date: {
            gte: '2013-01-01'
          }
        },
        orderBy: { date: 'asc' } 
      })
    } else {
      let limit = 30
      switch (timeframe) {
        case '일':
          limit = 90 
          break
        case '주':
          limit = 180 
          break
        case '월':
          limit = 1095 
          break
      }
      
      const recentData = await prismaPrice.dailyPrice.findMany({
        where: { asset: asset },
        orderBy: { date: 'desc' },
        take: limit
      })
      
      dailyPrices = recentData.reverse() 
    }

    if (dailyPrices.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '데이터가 없습니다.'
      })
    }

    let processedData: any[] = []

    switch (timeframe) {
      case '일':
        const recentDailyPrices = dailyPrices.slice(-90) 
        processedData = recentDailyPrices.map(price => ({
          date: price.date,
          price: price.close,
          change: price.diff,
          ratio: price.ratio
        }))
        break

      case '주':
        processedData = groupByWeek(dailyPrices)
        break

      case '월':
        processedData = groupByMonth(dailyPrices)
        break

      case '년':
        processedData = groupByYear(dailyPrices)
        break
    }

    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      success: true,
      data: processedData,
      asset: asset,
      timeframe: timeframe,
      count: processedData.length
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

function groupByWeek(dailyPrices: any[]) {
  const weeklyData: { [key: string]: any[] } = {}
  
  dailyPrices.forEach(price => {
    const date = new Date(price.date)
    const monday = new Date(date)
    monday.setDate(date.getDate() - date.getDay() + 1)
    const weekKey = monday.toISOString().split('T')[0]
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = []
    }
    weeklyData[weekKey].push(price)
  })

  const sortedWeeks = Object.keys(weeklyData).sort()
  const recentWeeks = sortedWeeks.slice(-26) 

  return recentWeeks.map(weekKey => {
    const weekPrices = weeklyData[weekKey]
    const firstPrice = weekPrices[0]
    const lastPrice = weekPrices[weekPrices.length - 1]
    
    return {
      date: weekKey,
      price: lastPrice.close, 
      change: lastPrice.close - firstPrice.close, 
      ratio: ((lastPrice.close - firstPrice.close) / firstPrice.close) * 100 
    }
  })
}

function groupByMonth(dailyPrices: any[]) {
  const monthlyData: { [key: string]: any[] } = {}
  
  dailyPrices.forEach(price => {
    const date = new Date(price.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = []
    }
    monthlyData[monthKey].push(price)
  })

  const sortedMonths = Object.keys(monthlyData).sort()
  const recentMonths = sortedMonths.slice(-36) 

  return recentMonths.map(monthKey => {
    const monthPrices = monthlyData[monthKey]
    const firstPrice = monthPrices[0]
    const lastPrice = monthPrices[monthPrices.length - 1]
    
    return {
      date: monthKey + '-01', 
      price: lastPrice.close, 
      change: lastPrice.close - firstPrice.close, 
      ratio: ((lastPrice.close - firstPrice.close) / firstPrice.close) * 100 
    }
  })
}

function groupByYear(dailyPrices: any[]) {
  const yearlyData: { [key: string]: any[] } = {}
  
  dailyPrices.forEach(price => {
    const date = new Date(price.date)
    const yearKey = date.getFullYear().toString()
    
    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = []
    }
    yearlyData[yearKey].push(price)
  })

  const currentYear = new Date().getFullYear()
  const filteredYears = Object.keys(yearlyData)
    .filter(year => parseInt(year) >= 2013 && parseInt(year) <= currentYear)
    .sort()

  return filteredYears.map(yearKey => {
    const yearPrices = yearlyData[yearKey]
    const firstPrice = yearPrices[0]
    const lastPrice = yearPrices[yearPrices.length - 1]
    
    return {
      date: yearKey + '-01-01', 
      price: lastPrice.close,
      change: lastPrice.close - firstPrice.close,
      ratio: ((lastPrice.close - firstPrice.close) / firstPrice.close) * 100 
    }
  })
}
