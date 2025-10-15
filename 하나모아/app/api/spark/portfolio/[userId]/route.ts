import { NextRequest, NextResponse } from 'next/server'

const SPARK_URL = process.env.SPARK_ANALYTICS_URL || 'https://spark-analytics-h3xj.zeabur.app'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    
    const response = await fetch(
      `${SPARK_URL}/api/analytics/portfolio/${userId}`,
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
        error: 'Spark 분석 서비스를 사용할 수 없습니다.' 
      },
      { status: 503 }
    )
  }
}

