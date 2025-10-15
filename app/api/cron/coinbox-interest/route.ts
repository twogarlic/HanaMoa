import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  return handleCoinboxInterest(request)
}

export async function POST(request: NextRequest) {
  return handleCoinboxInterest(request)
}

async function handleCoinboxInterest(request: NextRequest) {
  try {
    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url)
      const secret = searchParams.get('secret')
      
      if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    

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
              accountId: coinbox.user.accounts[0]?.id || '',
              type: 'COINBOX_INTEREST',
              amount: interestAmount, 
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
      message: '저금통 이자 지급 작업이 완료되었습니다.',
      data: {
        processedCount: coinboxes.length,
        results
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 이자 지급 작업에 실패했습니다.' },
      { status: 500 }
    )
  }
}
