import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET

    if (!naverClientId || !naverClientSecret) {
      return NextResponse.json({ error: 'Naver credentials not configured' }, { status: 500 })
    }

    const tokenUrl = 'https://nid.naver.com/oauth2.0/token'
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: naverClientId,
      client_secret: naverClientSecret,
      code: code,
      state: 'test' // 실제로는 요청 시 사용한 state를 사용해야 함
    })

    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    const tokenData = await response.json()
    
    return NextResponse.json(tokenData)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 