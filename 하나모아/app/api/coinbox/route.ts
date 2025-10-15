import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const coinbox = await prisma.coinbox.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        }
      }
    })

    if (!coinbox) {
      return NextResponse.json(
        { success: false, error: '저금통이 개설되지 않았습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: coinbox
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}
