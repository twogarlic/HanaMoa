import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    
    const coinboxes = await prisma.coinbox.findMany({
      where: { isActive: true },
      include: {
        user: {
          include: {
            accounts: true
          }
        }
      }
    })

    
    const results = []

    for (const coinbox of coinboxes) {
      try {
        const now = new Date()
        const lastInterestDate = coinbox.lastInterestDate || coinbox.createdAt
        
        const lastInterestMonth = new Date(lastInterestDate).getMonth()
        const lastInterestYear = new Date(lastInterestDate).getFullYear()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        if (lastInterestYear === currentYear && lastInterestMonth === currentMonth) {
          continue
        }

        if (coinbox.balance <= 0) {
          continue
        }

        const monthlyInterestRate = coinbox.interestRate / 100 / 12
        const interestAmount = coinbox.balance * monthlyInterestRate
        
        if (interestAmount <= 0) {
          continue
        }

        await prisma.$transaction(async (tx) => {
          const updatedCoinbox = await tx.coinbox.update({
            where: { id: coinbox.id },
            data: {
              balance: { increment: interestAmount },
              lastInterestDate: now,
              totalInterest: { increment: interestAmount }
            }
          })

          await tx.transaction.create({
            data: {
              userId: coinbox.userId,
              accountId: coinbox.user.accounts[0]?.id || '', // 첫 번째 계좌 사용
              type: 'COINBOX_INTEREST',
              amount: interestAmount, // 양수 (입금)
              balance: updatedCoinbox.balance,
              description: '저금통 이자 지급',
              referenceId: coinbox.id
            }
          })
        })

        results.push({
          userId: coinbox.userId,
          interestAmount: interestAmount,
          newBalance: coinbox.balance + interestAmount,
          interestType: 'monthly'
        })

      } catch (error) {
        results.push({
          userId: coinbox.userId,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        })
      }
    }


    return NextResponse.json({
      success: true,
      message: '저금통 이자 계산이 완료되었습니다.',
      data: {
        processedCount: coinboxes.length,
        results
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 이자 계산에 실패했습니다.' },
      { status: 500 }
    )
    }
}

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
      where: { userId }
    })

    if (!coinbox) {
      return NextResponse.json(
        { success: false, error: '저금통을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const now = new Date()
    const lastInterestDate = coinbox.lastInterestDate || coinbox.createdAt
    
    const lastInterestMonth = new Date(lastInterestDate).getMonth()
    const lastInterestYear = new Date(lastInterestDate).getFullYear()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const isCurrentMonthPaid = lastInterestYear === currentYear && lastInterestMonth === currentMonth
    
    const monthlyInterestRate = coinbox.interestRate / 100 / 12
    const pendingInterest = isCurrentMonthPaid ? 0 : coinbox.balance * monthlyInterestRate

    return NextResponse.json({
      success: true,
      data: {
        coinbox,
        interestInfo: {
          interestRate: coinbox.interestRate,
          totalInterest: coinbox.totalInterest,
          lastInterestDate: coinbox.lastInterestDate,
          isCurrentMonthPaid: isCurrentMonthPaid,
          pendingInterest: Math.max(0, pendingInterest),
          monthlyInterestRate: monthlyInterestRate
        }
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 이자 정보 조회에 실패했습니다.' },
      { status: 500 }
    )
    }
}
