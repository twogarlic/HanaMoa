import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
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

    if (coinbox.balance === 0) {
      return NextResponse.json(
        { success: false, error: '저금통에 비울 돈이 없습니다.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!user || !user.accounts.length) {
      return NextResponse.json(
        { success: false, error: '계좌를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const { accountId } = body
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: '계좌 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const targetAccount = user.accounts.find(acc => acc.id === accountId)
    if (!targetAccount) {
      return NextResponse.json(
        { success: false, error: '선택한 계좌를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    const transferAmount = coinbox.balance

    const result = await prisma.$transaction(async (tx) => {
      const updatedCoinbox = await tx.coinbox.update({
        where: { userId },
        data: { balance: 0 }
      })

      const updatedAccount = await tx.account.update({
        where: { id: targetAccount.id },
        data: { 
          balance: {
            increment: transferAmount
          }
        }
      })

      await tx.transaction.create({
        data: {
          userId,
          accountId: targetAccount.id,
          type: 'COINBOX_EMPTY',
          amount: transferAmount,
          balance: updatedAccount.balance,
          description: '저금통 비우기',
          referenceId: coinbox.id
        }
      })

      return {
        coinbox: updatedCoinbox,
        account: updatedAccount,
        transferAmount
      }
    })
    return NextResponse.json({
      success: true,
      data: {
        coinbox: result.coinbox,
        account: result.account,
        transferAmount: result.transferAmount
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 비우기에 실패했습니다.' },
      { status: 500 }
    )
  }
}
