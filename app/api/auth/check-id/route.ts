import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '아이디를 입력해주세요.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: '이미 사용 중인 아이디입니다.',
        isAvailable: false
      })
    }

    return NextResponse.json({
      success: true,
      message: '사용 가능한 아이디입니다.',
      isAvailable: true
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: '아이디 중복 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
    }
}
