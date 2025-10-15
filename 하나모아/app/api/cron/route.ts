import { NextResponse } from 'next/server'
import prismaPrice from '../../../lib/database-price'
import { spawn } from 'child_process'
import path from 'path'

const ASSETS = ['gold', 'silver', 'usd', 'jpy', 'eur', 'cny'] as const
type AssetType = typeof ASSETS[number]

const CRAWLER_SCRIPTS: Record<AssetType, string> = {
  gold: 'gold_crawler.py',
  silver: 'silver_crawler.py',
  usd: 'usd_crawler.py',
  jpy: 'jpy_crawler.py',
  eur: 'eur_crawler.py',
  cny: 'cny_crawler.py'
}

/**
 * Python 크롤러 실행
 */
function runCrawler(asset: AssetType): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', CRAWLER_SCRIPTS[asset])
    
    const pythonProcess = spawn('python3', [scriptPath])
    let data = ''
    let errorData = ''
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk
    })
    
    pythonProcess.stderr.on('data', (chunk) => {
      errorData += chunk
    })
    
    pythonProcess.on('close', (code) => {
      if (code === 0 && data.trim()) {
        try {
          const jsonResult = JSON.parse(data)
          resolve(jsonResult)
        } catch (jsonError) {
          const result = parseTextOutput(data)
          resolve(result)
        }
      } else {
        reject(new Error(`${asset} 크롤링 실패: ${errorData}`))
      }
    })
    
    setTimeout(() => {
      pythonProcess.kill()
      reject(new Error(`${asset} 크롤링 타임아웃`))
    }, 30000)
  })
}

/**
 * 텍스트 출력 파싱 (fallback)
 */
function parseTextOutput(data: string) {
  const lines = data.trim().split('\n')
  const result: any = {}
  
  lines.forEach(line => {
    if (line.includes('고시회차:')) {
      result.round = line.split(':')[1].trim()
    } else if (line.includes('시각:')) {
      result.time = line.substring(line.indexOf(':') + 1).trim()
    } else if (line.includes('시세:')) {
      result.currentPrice = parseFloat(line.split(':')[1].trim())
    } else if (line.includes('등락값:')) {
      result.changeValue = parseFloat(line.split(':')[1].trim())
    } else if (line.includes('등락률:')) {
      result.changeRatio = parseFloat(line.split(':')[1].trim())
    } else if (line.includes('상승여부:')) {
      result.isUp = parseInt(line.split(':')[1].trim())
    }
  })
  
  return result
}

/**
 * 실시간 시세 업데이트
 */
async function updateRealTimePrice(asset: AssetType): Promise<void> {
  try {
    
    const data = await runCrawler(asset)
    
    const priceData = {
      round: data.round?.toString() || '0',
      time: data.time || '',
      currentPrice: data.currentPrice || 0,
      changeValue: data.changeValue || 0,
      changeRatio: data.changeRatio || 0,
      isUp: data.isUp || 0,
      rawDateTime: data.rawDateTime || ''
    }
    
    await prismaPrice.realTimePrice.upsert({
      where: { asset },
      update: {
        currentPrice: priceData.currentPrice,
        changeValue: priceData.changeValue,
        changeRatio: priceData.changeRatio,
        isUp: priceData.isUp,
        round: priceData.round,
        time: priceData.time,
        rawDateTime: priceData.rawDateTime,
        updatedAt: new Date()
      },
      create: {
        asset,
        currentPrice: priceData.currentPrice,
        changeValue: priceData.changeValue,
        changeRatio: priceData.changeRatio,
        isUp: priceData.isUp,
        round: priceData.round,
        time: priceData.time,
        rawDateTime: priceData.rawDateTime
      }
    })
    
    
  } catch (error) {
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    
    const updatePromises = ASSETS.map(asset => 
      updateRealTimePrice(asset).catch(error => {
        return { asset, error: error.message }
      })
    )
    
    const results = await Promise.allSettled(updatePromises)
    
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length
    
    
    return NextResponse.json({
      success: true,
      message: `크론 작업 완료: ${successCount}개 성공, ${failureCount}개 실패`,
      timestamp: new Date().toISOString(),
      results: results.map((r, i) => ({
        asset: ASSETS[i],
        status: r.status,
        error: r.status === 'rejected' ? r.reason?.message : undefined
      }))
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '크론 작업 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
