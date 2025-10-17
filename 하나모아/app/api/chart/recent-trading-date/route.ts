import { NextRequest, NextResponse } from 'next/server'
import prismaPrice from '../../../../lib/database-price'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asset = searchParams.get('asset')
    
    if (!asset) {
      return NextResponse.json({
        success: false,
        error: 'asset 파라미터가 필요합니다.'
      }, { status: 400 })
    }

    const recentData = await prismaPrice.chartPrice.findFirst({
      where: { 
        asset: asset
      },
      select: {
        dateTime: true
      },
      orderBy: { 
        dateTime: 'desc' 
      }
    })

    if (!recentData) {
      return NextResponse.json({
        success: false,
        error: '해당 자산의 거래 데이터가 없습니다.'
      }, { status: 404 })
    }

    const recentDate = recentData.dateTime.substring(0, 8)

    return NextResponse.json({
      success: true,
      date: recentDate,
      asset: asset
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '최근 거래일 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
