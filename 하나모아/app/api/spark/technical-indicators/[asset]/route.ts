import { NextRequest, NextResponse } from 'next/server'

const SPARK_URL = process.env.SPARK_ANALYTICS_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asset: string }> }
) {
  try {
    const { asset } = await params
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '30'
    
    const response = await fetch(
      `${SPARK_URL}/api/analytics/technical-indicators/${asset}?days=${days}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Spark API 호출 실패: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data,
      powered_by: 'Apache Spark'
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '기술적 지표 조회에 실패했습니다.' 
      },
      { status: 500 }
    )
  }
}

