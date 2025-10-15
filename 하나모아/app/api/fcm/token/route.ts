import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, fcmToken } = body

    if (!userId || !fcmToken) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID와 FCM 토큰이 필요합니다.'
      }, { status: 400 })
    }

    await prisma.fCMToken.upsert({
      where: { userId },
      update: { token: fcmToken },
      create: { userId, token: fcmToken }
    })

    return NextResponse.json({
      success: true,
      message: 'FCM 토큰이 저장되었습니다.'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'FCM 토큰 저장에 실패했습니다.'
    }, { status: 500 })
    }
}
