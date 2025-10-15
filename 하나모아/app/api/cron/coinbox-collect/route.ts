import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  return handleCoinboxCollect(request)
}

export async function POST(request: NextRequest) {
  return handleCoinboxCollect(request)
}

async function handleCoinboxCollect(request: NextRequest) {
  try {
    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url)
      const secret = searchParams.get('secret')
      
      if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    

    const activeCoinboxes = await prisma.coinbox.findMany({
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

    for (const coinbox of activeCoinboxes) {
      try {
        const mainAccount = coinbox.user.accounts[0]
        
        if (!mainAccount) {
          continue
        }

        const currentBalance = mainAccount.balance
        const coinAmount = Math.floor(currentBalance % 1000)

        if (coinAmount === 0) {
          continue
        }

        if (coinbox.balance + coinAmount > coinbox.maxLimit) {
          const availableAmount = coinbox.maxLimit - coinbox.balance
          if (availableAmount <= 0) {
            continue
          }
          const transferAmount = availableAmount
          
          await prisma.$transaction(async (tx) => {
            const updatedAccount = await tx.account.update({
              where: { id: mainAccount.id },
              data: { balance: mainAccount.balance - transferAmount }
            })
            
            const updatedCoinbox = await tx.coinbox.update({
              where: { id: coinbox.id },
              data: { balance: coinbox.balance + transferAmount }
            })
            
            await tx.transaction.create({
              data: {
                userId: coinbox.userId,
                accountId: mainAccount.id,
                type: 'COINBOX_SAVE',
                amount: -transferAmount,
                balance: updatedAccount.balance,
                description: '저금통 자동 저축',
                referenceId: coinbox.id
              }
            })
          })

          results.push({
            userId: coinbox.userId,
            transferredAmount: transferAmount,
            reason: '한도 초과로 일부만 이체'
          })
        } else {
          await prisma.$transaction(async (tx) => {
            const updatedAccount = await tx.account.update({
              where: { id: mainAccount.id },
              data: { balance: mainAccount.balance - coinAmount }
            })
            
            const updatedCoinbox = await tx.coinbox.update({
              where: { id: coinbox.id },
              data: { balance: coinbox.balance + coinAmount }
            })
            
            await tx.transaction.create({
              data: {
                userId: coinbox.userId,
                accountId: mainAccount.id,
                type: 'COINBOX_SAVE',
                amount: -coinAmount, 
                balance: updatedAccount.balance,
                description: '저금통 자동 저축',
                referenceId: coinbox.id
              }
            })
          })

          results.push({
            userId: coinbox.userId,
            transferredAmount: coinAmount,
            reason: '정상 이체'
          })
        }
      } catch (error) {
        results.push({
          userId: coinbox.userId,
          transferredAmount: 0,
          reason: '오류 발생',
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        })
      }
    }


    return NextResponse.json({
      success: true,
      message: '저금통 동전 모으기 작업이 완료되었습니다.',
      data: {
        processedCount: activeCoinboxes.length,
        results
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 동전 모으기 작업에 실패했습니다.' },
      { status: 500 }
    )
  }
}
