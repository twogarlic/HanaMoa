import { NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

const EXGOLD_API_URL = 'https://prod-api.exgold.co.kr/api/v1/main/detail/domestic/price'

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Accept": "application/json",
  "Referer": "https://www.exgold.co.kr/",
  "Origin": "https://www.exgold.co.kr",
}

/**
 * 문자열을 float로 변환
 */
function toFloat(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    return parseFloat(value.replace(/,/g, '')) || 0
  }
  return 0
}

/**
 * 은 실시간 시세 데이터 업데이트
 */
async function updateSilverRealTimeData(): Promise<void> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      const response = await fetch(EXGOLD_API_URL, {
        headers: HEADERS,
        signal: AbortSignal.timeout(15000)
      })

    if (!response.ok) {
      throw new Error(`exgold API 호출 실패: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const items = data.data?.domesticLivePriceDtoList || []
    const agItem = items.find((x: any) => String(x.get?.("type") || x.type) === "Ag")
    
    if (!agItem) {
      throw new Error('Ag 항목을 찾을 수 없습니다.')
    }

    const currentPrice = toFloat(agItem.domesticPrice)
    const changeValue = toFloat(agItem.fluctuation)
    
    const prevPrice = currentPrice - changeValue
    const changeRatio = prevPrice > 0 ? (changeValue / prevPrice) * 100 : 0
    
    const isUp = changeValue > 0 ? 1 : 0

    const now = new Date()
    const currentTime = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    const formattedTime = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    await prismaPrice.realTimePrice.upsert({
      where: { asset: 'silver' },
      update: {
        currentPrice: currentPrice,
        changeValue: changeValue,
        changeRatio: changeRatio,
        isUp: isUp,
        round: '1',
        time: formattedTime,
        rawDateTime: currentTime,
        updatedAt: new Date()
      },
      create: {
        asset: 'silver',
        currentPrice: currentPrice,
        changeValue: changeValue,
        changeRatio: changeRatio,
        isUp: isUp,
        round: '1', 
        time: formattedTime,
        rawDateTime: currentTime
      }
    })

      return 
      
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000 
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError || new Error('은 실시간 시세 데이터 업데이트 실패')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    
    try {
      await updateSilverRealTimeData()
      
      
      return NextResponse.json({
        success: true,
        message: '은 실시간 시세 크론 작업 완료',
        timestamp: new Date().toISOString(),
        asset: 'silver'
      })
      
    } catch (updateError) {
      
      return NextResponse.json({
        success: false,
        message: '은 실시간 시세 업데이트 실패',
        error: updateError instanceof Error ? updateError.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '은 실시간 시세 크론 작업 전체 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
