import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { userId: userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '존재하지 않는 계정입니다.'
      }, { status: 404 })
    }

    await prisma.user.update({
      where: { userId: userId },
      data: {
        loginFailCount: 0,
        isLocked: false,
        lockedUntil: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '계정 잠금이 해제되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
