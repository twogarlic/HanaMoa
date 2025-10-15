import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 })
    }

    const exchanges = await prisma.productExchange.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            image: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      exchanges
    })

  } catch (error) {
    return NextResponse.json({ error: '교환 내역 조회에 실패했습니다.' }, { status: 500 })
    }
}
