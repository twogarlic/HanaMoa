import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const where: any = { userId }
    if (accountId) where.accountId = accountId
    if (type) where.type = type

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.transaction.count({ where })

    return NextResponse.json({
      success: true,
      data: transactions,
      total: totalCount,
      hasMore: offset + limit < totalCount
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '거래 내역 조회에 실패했습니다.' },
      { status: 500 }
    )
    }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, accountId, type, amount, balance, description, referenceId } = body

    if (!userId || !accountId || !type || amount === undefined || balance === undefined) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type,
        amount,
        balance,
        description,
        referenceId
      },
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '거래 내역 생성에 실패했습니다.' },
      { status: 500 }
    )
    }
}
