import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import { sendPushNotification } from '../../../../lib/fcm'
import prismaPrice from '../../../../lib/database-price'


const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100
}

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `ORD${year}${month}${day}${hour}${minute}${second}${random}`
}

async function createAndExecuteOrder(
  userId: string,
  accountId: string,
  asset: string,
  orderType: 'buy' | 'sell',
  priceType: 'limit' | 'market',
  limitPrice: number | null,
  quantity: number
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true }
    })
    
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }
    
    const account = user.accounts.find(acc => acc.id === accountId)
    if (!account) {
      return { success: false, error: '계좌를 찾을 수 없습니다.' }
    }
    
    const realTimePrice = await prismaPrice.realTimePrice.findUnique({
      where: { asset }
    })
    
    if (!realTimePrice) {
      return { success: false, error: `${asset} 자산의 실시간 가격을 찾을 수 없습니다.` }
    }
    
    const currentPrice = asset === 'gold' ? realTimePrice.currentPrice / 100 : realTimePrice.currentPrice
    
    let shouldExecuteImmediately = true
    let executionPrice = currentPrice
    
    if (priceType === 'limit' && limitPrice) {
      const priceThreshold = 0.01
      const priceDiff = Math.abs(limitPrice - currentPrice)
      
      if (orderType === 'buy') {
        shouldExecuteImmediately = limitPrice >= currentPrice || priceDiff <= priceThreshold
        executionPrice = limitPrice 
      } else {
        shouldExecuteImmediately = limitPrice <= currentPrice || priceDiff <= priceThreshold
        executionPrice = limitPrice 
      }
    }
    
    if (orderType === 'buy') {
      const totalAmount = executionPrice * quantity
      if (account.balance < totalAmount) {
        return { success: false, error: '계좌 잔액이 부족합니다.' }
      }
    } else {
      const holding = await prisma.holding.findUnique({
        where: { userId_asset: { userId, asset } }
      })
      
      if (!holding || holding.quantity < quantity) {
        return { success: false, error: '보유 자산이 부족합니다.' }
      }
    }
    
    const orderNumber = generateOrderNumber()
    const totalAmount = asset === 'gold' 
      ? Math.round((executionPrice * quantity * 100) * 100) / 100 
      : Math.round((executionPrice * quantity) * 100) / 100  
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        accountId,
        asset,
        orderType,
        priceType,
        limitPrice,
        quantity,
        totalAmount,
        status: shouldExecuteImmediately ? 'PENDING' : 'PENDING' 
      }
    })
    
    let updatedOrder
    
    if (shouldExecuteImmediately) {
      const execution = await prisma.execution.create({
        data: {
          orderId: order.id,
          executionPrice: Math.round(executionPrice * 100) / 100,
          executionQuantity: quantity,
          executionAmount: totalAmount
        }
      })
      
      updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          executedAt: new Date()
        },
        include: {
          executions: true,
          user: { select: { name: true } },
          account: { select: { accountName: true } }
        }
      })
      
    if (orderType === 'buy') {
      const updatedAccount = await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: Math.round(totalAmount * 100) / 100 } }
      })
      
      await prisma.transaction.create({
        data: {
          userId,
          accountId,
          type: 'ORDER_BUY',
          amount: -Math.round(totalAmount * 100) / 100, 
          balance: updatedAccount.balance,
          description: `${asset.toUpperCase()} 구매`,
          referenceId: order.id
        }
      })
      
      const existingHolding = await prisma.holding.findUnique({
        where: { userId_asset: { userId, asset } }
      })
      
      if (existingHolding) {
        const newTotalQuantity = roundToTwoDecimals(existingHolding.quantity + quantity)
        const newTotalAmount = roundToTwoDecimals(existingHolding.totalAmount + totalAmount)
        const newAveragePrice = roundToTwoDecimals(
          (existingHolding.averagePrice * existingHolding.quantity + executionPrice * quantity) / newTotalQuantity
        )
        
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
            quantity: roundToTwoDecimals(quantity),
            averagePrice: roundToTwoDecimals(executionPrice),
            totalAmount: roundToTwoDecimals(totalAmount)
          }
        })
      }
    } else {
      const updatedAccount = await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: Math.round(totalAmount * 100) / 100 } }
      })
      
      await prisma.transaction.create({
        data: {
          userId,
          accountId,
          type: 'ORDER_SELL',
          amount: Math.round(totalAmount * 100) / 100, 
          balance: updatedAccount.balance,
          description: `${asset.toUpperCase()} 판매`,
          referenceId: order.id
        }
      })
      
      const holding = await prisma.holding.findUnique({
        where: { userId_asset: { userId, asset } }
      })
      
      if (holding) {
        const newQuantity = roundToTwoDecimals(holding.quantity - quantity)
        const newTotalAmount = roundToTwoDecimals(newQuantity * holding.averagePrice)
        
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

    if (shouldExecuteImmediately) {
      try {
        const assetNames: { [key: string]: string } = {
          'gold': '금',
          'silver': '은',
          'usd': '달러',
          'eur': '유로',
          'jpy': '엔화',
          'cny': '위안'
        }

        const assetName = assetNames[asset] || asset.toUpperCase()
        const orderTypeText = orderType === 'buy' ? '구매' : '판매'
        
        await sendPushNotification(
          userId,
          '주문이 체결되었습니다',
          `${assetName} ${orderTypeText} 주문이 체결되었습니다.`,
          {
            type: 'ORDER_COMPLETED',
            orderId: order.id,
            asset: asset,
            orderType: orderType
          }
        )
      } catch (pushError) {
      }
    }
    } else {
      updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          executions: true,
          user: { select: { name: true } },
          account: { select: { accountName: true } }
        }
      })
    }
    
    return { success: true, order: updatedOrder }
    
  } catch (error) {
    return { success: false, error: '주문 처리 중 오류가 발생했습니다.' }
    }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, accountId, asset, orderType, priceType, limitPrice, quantity } = body
    
    if (!userId || !accountId || !asset || !orderType || !priceType || !quantity) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      }, { status: 400 })
    }
    
    if (!['buy', 'sell'].includes(orderType)) {
      return NextResponse.json({
        success: false,
        error: '주문 유형은 buy 또는 sell이어야 합니다.'
      }, { status: 400 })
    }
    
    if (!['limit', 'market'].includes(priceType)) {
      return NextResponse.json({
        success: false,
        error: '가격 유형은 limit 또는 market이어야 합니다.'
      }, { status: 400 })
    }
    
    if (priceType === 'limit' && !limitPrice) {
      return NextResponse.json({
        success: false,
        error: '지정가 주문의 경우 limitPrice가 필요합니다.'
      }, { status: 400 })
    }
    
    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: '수량은 0보다 커야 합니다.'
      }, { status: 400 })
    }
    
    const result = await createAndExecuteOrder(
      userId,
      accountId,
      asset,
      orderType,
      priceType,
      limitPrice,
      quantity
    )
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '주문이 성공적으로 체결되었습니다.',
        order: result.order
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
