import { NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import prismaPrice from '../../../../lib/database-price'

export async function GET() {
  try {
    
    const goldData = await fetchGoldData()
    
    if (!goldData || goldData.length < 100) {
      return NextResponse.json({
        success: false,
        error: '충분한 데이터가 없습니다. 최소 100일의 데이터가 필요합니다.'
      }, { status: 400 })
    }
    
    const prediction = await simplePredictionModel(goldData)
    
    await savePredictionToDB(prediction)
    
    return NextResponse.json({
      success: true,
      message: '모델 학습이 완료되었습니다.',
      timestamp: new Date().toISOString(),
      prediction: prediction
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '모델 학습 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

async function fetchGoldData() {
  try {
    const data = await prismaPrice.dailyPrice.findMany({
      where: { asset: 'gold' },
      orderBy: { date: 'desc' },
      take: 365
    })
    
    return data.reverse() 
  } catch (error) {
    return null
  }
}

async function simplePredictionModel(data: any[]) {
  if (data.length < 30) {
    throw new Error('데이터가 부족합니다.')
  }
  
  const recentData = data.slice(-30)
  const prices = recentData.map(d => d.close)
  
  const sma5 = calculateSMA(prices, 5)
  const sma20 = calculateSMA(prices, 20)
  
  const rsi = calculateRSI(prices)
  
  const volatility = calculateVolatility(prices)
  
  const recentTrend = analyzeTrend(prices.slice(-10))
  
  let predictionScore = 0
  
  if (sma5 > sma20) predictionScore += 0.3
  else predictionScore -= 0.3
  
  if (rsi < 30) predictionScore += 0.2
  else if (rsi > 70) predictionScore -= 0.2
  
  if (volatility < 0.02) predictionScore += 0.1 
  else if (volatility > 0.05) predictionScore -= 0.1
  
  if (recentTrend > 0) predictionScore += 0.2
  else predictionScore -= 0.2
  
  const direction = predictionScore > 0 ? '상승' : '하락'
  const confidence = Math.min(Math.abs(predictionScore), 0.8) + 0.2
  const probability = predictionScore > 0 ? 0.5 + predictionScore * 0.3 : 0.5 + predictionScore * 0.3
  
  return {
    direction,
    confidence: Math.max(0.2, Math.min(1.0, confidence)),
    probability: Math.max(0.1, Math.min(0.9, probability)),
    nextDayPrediction: predictionScore > 0 ? 1 : 0,
    basedOnDays: 30,
    lastUpdateDate: new Date().toISOString()
  }
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1]
  
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
  return sum / period
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50
  
  let gains = 0
  let losses = 0
  
  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0
  
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
  
  return Math.sqrt(variance)
}

function analyzeTrend(prices: number[]): number {
  if (prices.length < 2) return 0
  
  let trend = 0
  for (let i = 1; i < prices.length; i++) {
    trend += (prices[i] - prices[i - 1]) / prices[i - 1]
  }
  
  return trend / (prices.length - 1)
}

async function savePredictionToDB(prediction: any) {
  try {
    const predictionDate = new Date().toISOString().split('T')[0]
    
    const existingPrediction = await prismaPrice.goldPrediction.findUnique({
      where: {
        asset_predictionDate: {
          asset: 'gold',
          predictionDate: predictionDate
        }
      }
    })
    
    if (existingPrediction) {
      await prismaPrice.goldPrediction.update({
        where: {
          asset_predictionDate: {
            asset: 'gold',
            predictionDate: predictionDate
          }
        },
        data: {
          direction: prediction.direction,
          confidence: prediction.confidence,
          probability: prediction.probability,
          nextDayPrediction: prediction.nextDayPrediction,
          basedOnDays: prediction.basedOnDays,
          updatedAt: new Date()
        }
      })
    } else {
      await prismaPrice.goldPrediction.create({
        data: {
          asset: 'gold',
          predictionDate: predictionDate,
          direction: prediction.direction,
          confidence: prediction.confidence,
          probability: prediction.probability,
          nextDayPrediction: prediction.nextDayPrediction,
          basedOnDays: prediction.basedOnDays
        }
      })
    }
    
  } catch (error) {
    throw error
  }
}
