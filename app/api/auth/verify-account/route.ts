import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, name, ssn, phone } = await request.json()

    if (!userId || !name || !ssn || !phone) {
      return NextResponse.json({
        success: false,
        message: '모든 필드를 입력해주세요.'
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

    const isNameMatch = user.name === name
    const isSsnMatch = user.ssn === ssn
    const isPhoneMatch = user.phone === phone

    if (!isNameMatch || !isSsnMatch || !isPhoneMatch) {
      return NextResponse.json({
        success: false,
        message: '입력하신 정보가 등록된 정보와 일치하지 않습니다.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: '계정 정보가 확인되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
