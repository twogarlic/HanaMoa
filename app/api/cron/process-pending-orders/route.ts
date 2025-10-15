import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import prismaPrice from '../../../../lib/database-price'
import { PrismaClient } from '@prisma/client'

async function processPendingOrders(): Promise<void> {
  try {
    
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { include: { accounts: true } },
        executions: true
      }
    })
    
    if (pendingOrders.length === 0) {
      return
    }
    
    
    const ordersByAsset = pendingOrders.reduce((acc, order) => {
      if (!acc[order.asset]) acc[order.asset] = []
      acc[order.asset].push(order)
      return acc
    }, {} as Record<string, typeof pendingOrders>)
    
    for (const [asset, orders] of Object.entries(ordersByAsset)) {
      const realTimePrice = await prismaPrice.realTimePrice.findUnique({
        where: { asset }
      })
      
      if (!realTimePrice) {
        continue
      }
      
      const currentPrice = asset === 'gold' ? realTimePrice.currentPrice / 100 : realTimePrice.currentPrice
      
      for (const order of orders) {
        if (!order.limitPrice) continue
        
        let shouldExecute = false
        
        if (order.orderType === 'buy') {
          shouldExecute = order.limitPrice >= currentPrice
        } else if (order.orderType === 'sell') {
          shouldExecute = order.limitPrice <= currentPrice
        }
        
        if (shouldExecute) {
          try {
            await executePendingOrder(prisma, order, currentPrice)
          } catch (error) {
          }
        }
      }
    }
    
    
  } catch (error) {
  }
}

async function executePendingOrder(prisma: PrismaClient, order: any, currentPrice: number): Promise<void> {
  const { userId, accountId, asset, orderType, quantity, limitPrice } = order
  
  const executionPrice = limitPrice || currentPrice
  
  const executionAmount = asset === 'gold' 
    ? Math.round((executionPrice * quantity * 100) * 100) / 100 
    : Math.round((executionPrice * quantity) * 100) / 100 
  const execution = await prisma.execution.create({
    data: {
      orderId: order.id,
      executionPrice: limitPrice || currentPrice,
      executionQuantity: quantity,
      executionAmount
    }
  })
  
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'COMPLETED',
      executedAt: new Date()
    }
  })

  const assetLabels = {
    gold: '금',
    silver: '은',
    usd: '달러',
    jpy: '엔화',
    eur: '유로',
    cny: '위안'
  }
  
  const orderTypeLabels = {
    buy: '구매',
    sell: '판매'
  }
  
  const assetLabel = assetLabels[asset as keyof typeof assetLabels] || asset
  const orderTypeLabel = orderTypeLabels[orderType as keyof typeof orderTypeLabels] || orderType
  
  await prisma.notification.create({
    data: {
      userId: userId,
      type: 'ORDER_EXECUTED',
      title: `${orderTypeLabel} 주문 체결 완료`,
      message: `${assetLabel} 거래가 ${executionPrice.toLocaleString()}원에 체결되었습니다.`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        asset: asset,
        orderType: orderType,
        executionPrice: executionPrice,
        quantity: quantity,
        executionAmount: executionAmount
      }
    }
  })
  
  if (orderType === 'buy') {
    const totalAmount = asset === 'gold' 
      ? Math.round((executionPrice * quantity * 100) * 100) / 100 
      : Math.round((executionPrice * quantity) * 100) / 100 
    
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { balance: { decrement: totalAmount } }
    })
    
    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'ORDER_BUY',
        amount: -totalAmount,
        balance: updatedAccount.balance,
        description: `${asset.toUpperCase()} 구매 (대기주문 체결)`,
        referenceId: order.id
      }
    })
    
    const existingHolding = await prisma.holding.findUnique({
      where: { userId_asset: { userId, asset } }
    })
    
    if (existingHolding) {
      const newTotalQuantity = existingHolding.quantity + quantity
      const newTotalAmount = Math.round((existingHolding.totalAmount + totalAmount) * 100) / 100
      const newAveragePrice = Math.round(
        ((existingHolding.averagePrice * existingHolding.quantity + executionPrice * quantity) / newTotalQuantity) * 100
      ) / 100
      
      await prisma.holding.update({
        where: { userId_asset: { userId, asset } },
        data: {
          quantity: newTotalQuantity,
          averagePrice: newAveragePrice,
          totalAmount: newTotalAmount
        }
      })
    } else {
      await prisma.holding.create({
        data: {
          userId,
          asset,
          quantity,
          averagePrice: Math.round(executionPrice * 100) / 100,
          totalAmount
        }
      })
    }
  } else {
    const totalAmount = asset === 'gold' 
      ? Math.round((executionPrice * quantity * 100) * 100) / 100 
      : Math.round((executionPrice * quantity) * 100) / 100
    
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: totalAmount } }
    })
    
    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'ORDER_SELL',
        amount: totalAmount, 
        balance: updatedAccount.balance,
        description: `${asset.toUpperCase()} 판매 (대기주문 체결)`,
        referenceId: order.id
      }
    })
    
    const holding = await prisma.holding.findUnique({
      where: { userId_asset: { userId, asset } }
    })
    
    if (holding) {
      const newQuantity = Math.round((holding.quantity - quantity) * 100) / 100
      const newTotalAmount = Math.round((newQuantity * holding.averagePrice) * 100) / 100
      
      if (newQuantity > 0) {
        await prisma.holding.update({
          where: { userId_asset: { userId, asset } },
          data: {
            quantity: newQuantity,
            totalAmount: newTotalAmount
          }
        })
      } else {
        await prisma.holding.delete({
          where: { userId_asset: { userId, asset } }
        })
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await processPendingOrders()

    return NextResponse.json({
      success: true,
      message: '대기주문 처리 크론 작업 완료',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '대기주문 처리 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
