import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { name, ssn, phone } = await request.json()

    if (!name || !ssn || !phone) {
      return NextResponse.json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        name: name,
        ssn: ssn,
        phone: phone
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '가입되지 않은 사용자입니다.'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      userId: user.userId,
      message: '아이디를 찾았습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
