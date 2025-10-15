import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, isActive } = body

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 활성화 상태가 필요합니다.' },
        { status: 400 }
      )
    }

    const coinbox = await prisma.coinbox.findUnique({
      where: { userId }
    })

    if (!coinbox) {
      return NextResponse.json(
        { success: false, error: '저금통이 개설되지 않았습니다.' },
        { status: 404 }
      )
    }

    const updatedCoinbox = await prisma.coinbox.update({
      where: { userId },
      data: { isActive }
    })


    return NextResponse.json({
      success: true,
      data: updatedCoinbox
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 규칙 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}
