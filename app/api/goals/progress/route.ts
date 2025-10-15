import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (goals.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: userId
      }
    })

    const accountIds = accounts.map(account => account.id)

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const executions = await prisma.execution.findMany({
          where: {
            order: {
              accountId: {
                in: accountIds
              },
              asset: goal.asset
            },
            executedAt: {
              gte: goal.startDate,
              lte: goal.targetDate
            }
          },
          include: {
            order: true
          }
        })

        executions.forEach(exec => {
        })

        let totalBuyAmount = 0
        let totalSellAmount = 0

        executions.forEach(execution => {
          if (execution.order.orderType.toLowerCase() === 'buy') {
            totalBuyAmount += execution.executionQuantity
          } else if (execution.order.orderType.toLowerCase() === 'sell') {
            totalSellAmount += execution.executionQuantity
          }
        })

        const netAmount = totalBuyAmount - totalSellAmount
        const currentAmount = Math.max(0, netAmount) 

        const progress = goal.targetAmount > 0 
          ? Math.min((currentAmount / goal.targetAmount) * 100, 100) 
          : 0
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const targetDate = new Date(goal.targetDate)
        targetDate.setHours(0, 0, 0, 0)
        
        if (today > targetDate && progress < 100) {
          await prisma.goal.update({
            where: { id: goal.id },
            data: { status: 'FAILED' }
          })
          
          return {
            ...goal,
            status: 'FAILED',
            currentAmount: currentAmount,
            progress: Math.round(progress * 100) / 100,
            totalBuyAmount: totalBuyAmount,
            totalSellAmount: totalSellAmount,
            netAmount: netAmount
          }
        }
        
        if (progress >= 100 && goal.status === 'ACTIVE') {
          await prisma.goal.update({
            where: { id: goal.id },
            data: { status: 'COMPLETED' }
          })
          
          return {
            ...goal,
            status: 'COMPLETED',
            currentAmount: currentAmount,
            progress: 100,
            totalBuyAmount: totalBuyAmount,
            totalSellAmount: totalSellAmount,
            netAmount: netAmount
          }
        }

        return {
          ...goal,
          currentAmount: currentAmount,
          progress: Math.round(progress * 100) / 100, 
          totalBuyAmount: totalBuyAmount,
          totalSellAmount: totalSellAmount,
          netAmount: netAmount
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: goalsWithProgress
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '목표 달성률 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
