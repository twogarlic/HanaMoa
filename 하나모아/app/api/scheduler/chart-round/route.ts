import { NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

const CHART_ASSETS = ['gold', 'usd', 'jpy', 'eur', 'cny'] as const
type ChartAssetType = typeof CHART_ASSETS[number]

const ASSET_URLS = {
  gold: 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=CMDT_GD&category=metals&chartInfoType=marketindex&scriptChartType=day',
  usd: 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_USDKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day',
  eur: 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_EURKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day',
  jpy: 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_JPYKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day',
  cny: 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_CNYKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day'
} as const

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Referer": "https://m.stock.naver.com/",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin"
}

function toFloat(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    return parseFloat(value.replace(/,/g, '')) || 0
  }
  return 0
}

async function fetchChartRoundData(asset: ChartAssetType): Promise<any> {
  try {
    if (!ASSET_URLS[asset]) {
      throw new Error(`지원하지 않는 자산: ${asset}`)
    }

    const url = ASSET_URLS[asset]
    
    const ticksResponse = await fetch(url, { 
      headers: HEADERS,
      signal: AbortSignal.timeout(10000)
    })

    if (!ticksResponse.ok) {
      throw new Error(`틱 데이터 API 호출 실패: ${ticksResponse.status} ${ticksResponse.statusText}`)
    }

    const ticksData = await ticksResponse.json()

    const now = new Date()
    const currentTime = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    
    const priceInfos: any[] = []
    const tradeBase = ticksData.result?.tradeBaseAt || now.toISOString().slice(0, 10).replace(/-/g, '')
    const lastTradeBase = ticksData.result?.lastTradeBaseAt || now.toISOString().slice(0, 10).replace(/-/g, '')
    
    let todayInfos = ticksData.result?.priceInfos?.filter((x: any) => 
      String(x.localDateTime).startsWith(tradeBase)
    ) || []
    
    if (todayInfos.length === 0) {
      todayInfos = ticksData.result?.lastPriceInfos?.filter((x: any) => 
        String(x.localDateTime).startsWith(lastTradeBase)
      ) || []
    }
    
    const limitedInfos = todayInfos.slice(-3)
    for (const info of limitedInfos) {
      priceInfos.push({
        localDateTime: String(info.localDateTime),
        currentPrice: toFloat(info.currentPrice),
        degreeCount: String(info.degreeCount)
      })
    }
    
    const result = {
      isSuccess: true,
      detailCode: "",
      message: "",
      result: {
        code: asset === 'gold' ? "CMDT_GD" : `CMDT_${asset.toUpperCase()}`,
        infoType: "marketindex",
        periodType: "day",
        tradeBaseAt: tradeBase,
        lastTradeBaseAt: lastTradeBase,
        localDateTimeNow: currentTime,
        priceInfos: priceInfos
      }
    }
    
    return result
    
  } catch (error) {
    throw error
  }
}

async function updateChartRoundData(asset: ChartAssetType): Promise<void> {
  
  try {
    
    const data = await fetchChartRoundData(asset)
    
    if (!data || !data.isSuccess || !data.result || !data.result.priceInfos) {
      throw new Error(`${asset} 회차 차트 데이터 형식이 올바르지 않습니다.`)
    }
    
    const priceInfos = data.result.priceInfos
    
    for (const priceInfo of priceInfos) {
      const { localDateTime, currentPrice, degreeCount } = priceInfo
      
      await prismaPrice.chartPrice.upsert({
        where: {
          asset_dateTime_degreeCount: {
            asset,
            dateTime: localDateTime,
            degreeCount: parseInt(degreeCount)
          }
        },
        update: {
          price: currentPrice,
          createdAt: new Date()
        },
        create: {
          asset,
          price: currentPrice,
          degreeCount: parseInt(degreeCount),
          dateTime: localDateTime
        }
      })
    }
    
    
  } catch (error) {
    throw error
  }
}

/**
 * 오래된 데이터 정리 (7일 이상 된 데이터 삭제)
 */
async function cleanupOldChartData(): Promise<void> {
  
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const result = await prismaPrice.chartPrice.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
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
    
    
    const updatePromises = CHART_ASSETS.map(asset => 
      updateChartRoundData(asset).catch(error => {
        return { asset, error: error.message }
      })
    )
    
    const results = await Promise.allSettled(updatePromises)
    
    await cleanupOldChartData()
    
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length
    
    
    return NextResponse.json({
      success: true,
      message: `회차 차트 크론 작업 완료: ${successCount}개 성공, ${failureCount}개 실패`,
      timestamp: new Date().toISOString(),
      results: results.map((r, i) => ({
        asset: CHART_ASSETS[i],
        status: r.status,
        error: r.status === 'rejected' ? r.reason?.message : undefined
      }))
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '회차 차트 크론 작업 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
