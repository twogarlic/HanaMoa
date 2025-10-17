import { NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

/**
 * Silver 회차 차트 데이터 업데이트
 */
async function updateSilverChartRoundData(): Promise<void> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
        
        const now = new Date()
        
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
        const fromTime = thirtyMinutesAgo.toISOString().replace(/\.\d{3}Z$/, '')
        const toTime = now.toISOString().replace(/\.\d{3}Z$/, '')
        
        const url = `https://prod-api.exgold.co.kr/api/v1/main/chart/live/price/domestic?type=AG&from=${fromTime}&to=${toTime}`
        
        
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000)
        })
        
        if (!response.ok) {
          throw new Error(`Silver API 요청 실패: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
      
        if (!data.success || !data.data || data.data.length === 0) {
          throw new Error('Silver 데이터가 비어있습니다.')
        }
        
        const priceData = data.data.sort((a: any, b: any) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        )
        
        const limitedData = priceData.slice(-10) 
        
        const dbPromises = []
        let degreeCount = 1
        
        for (let i = 0; i < limitedData.length; i += 2) {
          const item = limitedData[i]
          
          const dt = new Date(item.dateTime)
          const localDateTime = dt.toISOString().replace(/[T:-]/g, '').substring(0, 14)
          
          dbPromises.push(
            prismaPrice.chartPrice.upsert({
              where: {
                asset_dateTime_degreeCount: {
                  asset: 'silver',
                  dateTime: localDateTime,
                  degreeCount: degreeCount
                }
              },
              update: {
                price: parseFloat(item.domesticPrice),
                createdAt: new Date()
              },
              create: {
                asset: 'silver',
                price: parseFloat(item.domesticPrice),
                degreeCount: degreeCount,
                dateTime: localDateTime
              }
            }).catch((dbError) => {
              return null
            })
          )
          
          degreeCount++
        }
        
        await Promise.allSettled(dbPromises)
        
      return
      
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000 
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError || new Error('Silver 회차 차트 데이터 업데이트 실패')
}

/**
 * 오래된 Silver 데이터 정리 (3일 이상 된 데이터 삭제)
 */
async function cleanupOldSilverChartData(): Promise<void> {
  
  try {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    
    const result = await prismaPrice.chartPrice.deleteMany({
      where: {
        asset: 'silver',
        createdAt: {
          lt: threeDaysAgo
        }
      }
    })
    
    
  } catch (error) {
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    
    try {
      await updateSilverChartRoundData()
      
      await cleanupOldSilverChartData()
      
      
      return NextResponse.json({
        success: true,
        message: 'Silver 회차 차트 크론 작업 완료',
        timestamp: new Date().toISOString(),
        asset: 'silver'
      })
      
    } catch (updateError) {
      
      try {
        await cleanupOldSilverChartData()
      } catch (cleanupError) {
      }
      
      return NextResponse.json({
        success: false,
        message: 'Silver 회차 차트 데이터 업데이트 실패 (정리 작업은 완료)',
        error: updateError instanceof Error ? updateError.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Silver 회차 차트 크론 작업 전체 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
