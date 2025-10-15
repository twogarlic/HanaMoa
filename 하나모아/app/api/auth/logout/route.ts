import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    })

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '로그아웃 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

