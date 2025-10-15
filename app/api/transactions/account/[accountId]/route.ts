import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const { accountId } = await params

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        accountId: accountId
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.transaction.count({
      where: {
        userId,
        accountId: accountId
      }
    })

    return NextResponse.json({
      success: true,
      data: transactions,
      total: totalCount,
      hasMore: offset + limit < totalCount
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '계좌 거래 내역 조회에 실패했습니다.' },
      { status: 500 }
    )
    }
}
