import { NextRequest, NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'predict'
    
    const fastApiUrl = process.env.FASTAPI_ML_SERVICE_URL
    
    if (!fastApiUrl) {
      return await fallbackToLegacyLogic(action)
    }
        
    let goldData
    
    try {
      if (!prismaPrice) {
        throw new Error('Prisma Client is not initialized')
      }
      
      goldData = await prismaPrice.dailyPrice.findMany({
        where: { asset: 'gold' },
        orderBy: { date: 'desc' },
        take: 15, 
        select: {
          date: true,
          close: true,
          diff: true,
          ratio: true
        }
      })
      
    } catch (dbError: any) {
      throw new Error(`Database query failed: ${dbError.message}`)
    }
    
    const sortedData = goldData.reverse().map(row => ({
      d: typeof row.date === 'string' ? row.date.slice(0, 10) : (row.date as Date).toISOString().slice(0, 10), 
      c: parseFloat(row.close.toFixed(2)),
      f: parseFloat(row.diff.toFixed(2)),
      r: parseFloat(row.ratio.toFixed(2))
    }))
        
    const response = await fetch(`${fastApiUrl}/predict/prediction`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        action: action,
        data: sortedData
      })
    })
    
    if (!response.ok) {
      throw new Error(`FastAPI 서비스 오류: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.prediction !== undefined) {
      try {
        const today = new Date().toISOString().split('T')[0] 
        
        await prismaPrice.goldPrediction.upsert({
          where: {
            asset_predictionDate: {
              asset: 'gold',
              predictionDate: today
            }
          },
          update: {
            direction: result.direction,
            confidence: result.confidence,
            probability: result.probability,
            nextDayPrediction: result.prediction,
            basedOnDays: result.data_period?.total_records || 15
          },
          create: {
            asset: 'gold',
            predictionDate: today,
            direction: result.direction,
            confidence: result.confidence,
            probability: result.probability,
            nextDayPrediction: result.prediction,
            basedOnDays: result.data_period?.total_records || 15
          }
        })
              } catch (saveError) {
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
        const action = new URL(request.url).searchParams.get('action') || 'predict'
    return await fallbackToLegacyLogic(action)
  } finally {
    await prismaPrice.$disconnect()
  }
}

async function fallbackToLegacyLogic(action: string) {  
  if (action === 'train') {
    return await trainModelLegacy()
  } else if (action === 'predict') {
    return await predictGoldPriceLegacy()
  } else if (action === 'status') {
    return await getModelStatusLegacy()
  } else {
    return NextResponse.json(
      { error: '잘못된 액션입니다. action은 train, predict, status 중 하나여야 합니다.' },
      { status: 400 }
    )
  }
}

async function trainModelLegacy() {
  try {    
    const scriptPath = path.join(process.cwd(), 'scripts', 'gold_prediction_model.py')
    
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { error: '모델 학습 스크립트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const pythonProcess = spawn('python3', [scriptPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PRICE_DATABASE_URL: process.env.PRICE_DATABASE_URL,
        DATABASE_URL_RAILWAY: process.env.DATABASE_URL_RAILWAY,
        DATABASE_URL: process.env.DATABASE_URL
      }
    })
    
    let output = ''
    let errorOutput = ''
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: '모델 학습이 완료되었습니다.',
            output: output
          }))
        } else {
          resolve(NextResponse.json({
            success: false,
            error: '모델 학습 중 오류가 발생했습니다.',
            output: output,
            errorOutput: errorOutput
          }, { status: 500 }))
        }
      })
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: '모델 학습 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function predictGoldPriceLegacy() {
  try {
    const recentPrices = await prismaPrice.dailyPrice.findMany({
      where: { asset: 'gold' },
      orderBy: { date: 'desc' },
      take: 30
    })
    
    if (recentPrices.length < 30) {
      return NextResponse.json(
        { error: '예측을 위한 충분한 데이터가 없습니다. (최소 30일 필요)' },
        { status: 400 }
      )
    }
    
    const sortedPrices = recentPrices.reverse()
    
    const prediction = await performSimplePrediction(sortedPrices)
    
    return NextResponse.json({
      success: true,
      prediction: {
        direction: prediction.direction,
        confidence: prediction.confidence,
        probability: prediction.probability,
        nextDayPrediction: prediction.nextDayPrediction,
        basedOnDays: 30,
        lastUpdateDate: new Date().toISOString()
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: '예측 수행 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function performSimplePrediction(prices: any[]) {
  const recentChanges = prices.slice(-7).map(p => p.diff)
  const avgChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length
  
  const isUpward = avgChange > 0
  const confidence = Math.min(Math.abs(avgChange) / 1000, 0.8) 
  
  return {
    direction: isUpward ? '상승' : '하락',
    confidence: Math.max(confidence, 0.5), 
    probability: isUpward ? 0.5 + confidence / 2 : 0.5 - confidence / 2,
    nextDayPrediction: isUpward ? 1 : 0
  }
}

async function getModelStatusLegacy() {
  try {
    const modelInfoPath = path.join(process.cwd(), 'models', 'model_info.json')
    
    if (!fs.existsSync(modelInfoPath)) {
      return NextResponse.json({
        success: true,
        status: 'not_trained',
        message: '모델이 아직 학습되지 않았습니다.'
      })
    }
    
    const modelInfo = JSON.parse(fs.readFileSync(modelInfoPath, 'utf-8'))
    
    return NextResponse.json({
      success: true,
      status: 'trained',
      modelInfo: {
        lastTrainingDate: modelInfo.last_training_date,
        dataPeriod: modelInfo.data_period,
        sequenceLength: modelInfo.sequence_length,
        features: modelInfo.features
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: '모델 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
