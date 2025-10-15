import { NextResponse } from 'next/server'
import prismaPrice from '../../../../../lib/database-price'

export async function GET() {
  try {
    const latestPrediction = await prismaPrice.goldPrediction.findFirst({
      where: { asset: 'gold' },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestPrediction) {
      return NextResponse.json({
        success: false,
        error: '예측 데이터가 없습니다. 관리자에게 문의하세요.'
      }, { status: 404 })
    }
    
    const prediction = {
      direction: latestPrediction.direction,
      confidence: latestPrediction.confidence,
      probability: latestPrediction.probability,
      nextDayPrediction: latestPrediction.nextDayPrediction,
      basedOnDays: latestPrediction.basedOnDays,
      lastUpdateDate: latestPrediction.createdAt.toISOString()
    }
    
    return NextResponse.json({
      success: true,
      prediction: prediction
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '예측 데이터를 불러오는데 실패했습니다.'
    }, { status: 500 })
  }
}
