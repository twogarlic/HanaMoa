import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { keyword, x, y, radius = 10000, size = 15 } = await request.json()


    if (!keyword || !x || !y) {
      return NextResponse.json({
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    
    if (!apiKey || apiKey === 'YOUR_KAKAO_API_KEY') {
      return NextResponse.json({
        success: false,
        error: '카카오 API 키가 설정되지 않았습니다.'
      }, { status: 500 })
    }

    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&x=${x}&y=${y}&radius=${radius}&size=${size}`

    const origin = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://hanamoa.co.kr' 
                     : 'http://localhost:3000')

    const kakaoResponse = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${apiKey}`,
        'KA': `sdk/1.0 os/javascript origin/${origin}`
      }
    })


    if (!kakaoResponse.ok) {
      const errorText = await kakaoResponse.text()
      throw new Error(`카카오 API 호출 실패: ${kakaoResponse.status} - ${errorText}`)
    }

    const data = await kakaoResponse.json()

    return NextResponse.json({
      success: true,
      documents: data.documents || [],
      meta: data.meta || {}
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `장소 검색 중 오류가 발생했습니다: ${error.message}`
    }, { status: 500 })
  }
}
