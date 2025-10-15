import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

/*
 * 계좌 입금 API
 * POST /api/transactions/deposit
 * Body: { userId, accountId, amount, description? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, accountId, amount, description } = body
    
    if (!userId || !accountId || !amount) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: '입금 금액은 0보다 커야 합니다.' },
        { status: 400 }
      )
    }
    
    const result = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { 
          balance: {
            increment: amount
          }
        }
      })
      
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId,
          type: 'DEPOSIT',
          amount: amount,
          balance: updatedAccount.balance,
          description: description || '계좌 입금',
          referenceId: `deposit_${Date.now()}`
        }
      })
      
      return {
        account: updatedAccount,
        transaction
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        account: result.account,
        transaction: result.transaction
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '계좌 입금에 실패했습니다.' },
      { status: 500 }
    )
    }
}
