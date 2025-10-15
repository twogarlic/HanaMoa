import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, phone } = await request.json()

    if (!userId || !phone) {
      return NextResponse.json({
        success: false,
        message: '아이디와 전화번호를 입력해주세요.'
      }, { status: 400 })
    }

    const userById = await prisma.user.findUnique({
      where: { userId: userId }
    })

    if (!userById) {
      return NextResponse.json({
        success: false,
        message: '가입되지 않은 아이디입니다.'
      }, { status: 404 })
    }

    if (userById.phone !== phone) {
      return NextResponse.json({
        success: false,
        message: '해당 아이디에 등록된 전화번호가 아닙니다.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: '사용자 정보가 확인되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
