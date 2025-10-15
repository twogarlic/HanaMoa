import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: goalId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: userId
      }
    })

    if (!goal) {
      return NextResponse.json({
        success: false,
        error: '목표를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: userId
      }
    })

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          goalId: goal.id,
          currentAmount: 0,
          targetAmount: goal.targetAmount,
          progress: 0,
          totalBuyAmount: 0,
          totalSellAmount: 0,
          netAmount: 0
        }
      })
    }

    const accountIds = accounts.map(account => account.id)

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

    return NextResponse.json({
      success: true,
      data: {
        goalId: goal.id,
        currentAmount: currentAmount,
        targetAmount: goal.targetAmount,
        progress: Math.round(progress * 100) / 100,
        totalBuyAmount: totalBuyAmount,
        totalSellAmount: totalSellAmount,
        netAmount: netAmount,
        startDate: goal.startDate,
        targetDate: goal.targetDate,
        asset: goal.asset
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '목표 달성률 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
