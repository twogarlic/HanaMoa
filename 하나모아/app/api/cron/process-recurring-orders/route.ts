import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import { sendPushNotification } from '../../../../lib/fcm'
import prismaPrice from '../../../../lib/database-price'

async function processRecurringOrders() {
  try {
    
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    const allRecurringOrders = await prisma.recurringOrder.findMany({
      include: {
        user: true
      }
    })
    
    
    const activeRecurringOrders = await prisma.recurringOrder.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: today },
        endDate: { gte: today }
      },
      include: {
        user: true
      }
    })


    const results = []

    for (const order of activeRecurringOrders) {
      try {
        const shouldExecute = await checkExecutionCondition(order, today)
        
        if (!shouldExecute) {
          continue
        }

        const currentPrice = await getCurrentAssetPrice(order.asset)
        if (!currentPrice) {
          continue
        }

        let mainAccount = await prisma.account.findFirst({
          where: { 
            userId: order.userId,
            accountNumber: { startsWith: '282-' }
          }
        })
        
        if (!mainAccount) {
          mainAccount = await prisma.account.findFirst({
            where: { 
              userId: order.userId
            }
          })
        }

        if (!mainAccount) {
          continue
        }

        const totalAmount = order.asset === 'gold' 
          ? order.quantity * currentPrice  
          : order.quantity * currentPrice

        if (order.orderType === 'BUY') {
          if (mainAccount.balance < totalAmount) {
            await sendFailureNotification(order.userId, 'balance', order.asset, order.quantity)
            continue
          }
        } else if (order.orderType === 'SELL') {
          const holding = await prisma.holding.findFirst({
            where: { userId: order.userId, asset: order.asset }
          })
          
          if (!holding || holding.quantity < order.quantity) {
            await sendFailureNotification(order.userId, 'holding', order.asset, order.quantity)
            continue
          }
        }

        const orderResult = await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              orderNumber: `RO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: order.userId,
              accountId: mainAccount.id,
              asset: order.asset,
              orderType: order.orderType.toLowerCase(),
              priceType: 'market',
              quantity: order.quantity,
              totalAmount: totalAmount,
              status: 'COMPLETED',
              executedAt: new Date()
            }
          })

          if (order.orderType === 'BUY') {
            await tx.account.update({
              where: { id: mainAccount.id },
              data: { balance: { decrement: totalAmount } }
            })

            const existingHolding = await tx.holding.findFirst({
              where: { userId: order.userId, asset: order.asset }
            })

            if (existingHolding) {
              const newTotalQuantity = Math.round((existingHolding.quantity + order.quantity) * 100) / 100
              const newTotalAmount = Math.round((existingHolding.totalAmount + totalAmount) * 100) / 100
              const newAveragePrice = Math.round(
                ((existingHolding.averagePrice * existingHolding.quantity + currentPrice * order.quantity) / newTotalQuantity) * 100
              ) / 100
              
              await tx.holding.update({
                where: { id: existingHolding.id },
                data: { 
                  quantity: newTotalQuantity,
                  averagePrice: newAveragePrice,
                  totalAmount: newTotalAmount
                }
              })
            } else {
              await tx.holding.create({
                data: {
                  userId: order.userId,
                  asset: order.asset,
                  quantity: order.quantity,
                  averagePrice: Math.round(currentPrice * 100) / 100,
                  totalAmount: totalAmount
                }
              })
            }

            await tx.transaction.create({
              data: {
                userId: order.userId,
                accountId: mainAccount.id,
                type: 'ORDER_BUY',
                amount: totalAmount,
                description: `정기 주문 - ${order.asset} ${order.quantity}${order.asset === 'gold' ? 'g' : order.asset === 'silver' ? 'g' : ''} 구매`,
                balance: mainAccount.balance - totalAmount
              }
            })
          } else if (order.orderType === 'SELL') {
            await tx.account.update({
              where: { id: mainAccount.id },
              data: { balance: { increment: totalAmount } }
            })

            const existingHolding = await tx.holding.findFirst({
              where: { userId: order.userId, asset: order.asset }
            })

            if (existingHolding) {
              const newQuantity = Math.round((existingHolding.quantity - order.quantity) * 100) / 100
              const newTotalAmount = Math.round((newQuantity * existingHolding.averagePrice) * 100) / 100
              
              if (newQuantity > 0) {
                await tx.holding.update({
                  where: { id: existingHolding.id },
                  data: { 
                    quantity: newQuantity,
                    totalAmount: newTotalAmount
                  }
                })
              } else {
                await tx.holding.delete({
                  where: { id: existingHolding.id }
                })
              }
            }

            await tx.transaction.create({
              data: {
                userId: order.userId,
                accountId: mainAccount.id,
                type: 'ORDER_SELL',
                amount: totalAmount,
                description: `정기 주문 - ${order.asset} ${order.quantity}${order.asset === 'gold' ? 'g' : order.asset === 'silver' ? 'g' : ''} 판매`,
                balance: mainAccount.balance + totalAmount
              }
            })
          }

          return newOrder
        })

        await prisma.recurringOrder.update({
          where: { id: order.id },
          data: {
            lastExecuted: today,
            totalExecutions: { increment: 1 }
          }
        })

        results.push({
          orderId: order.id,
          status: 'success',
          executedOrder: orderResult.id,
          amount: totalAmount
        })


      } catch (orderError) {
        results.push({
          orderId: order.id,
          status: 'error',
          error: orderError instanceof Error ? orderError.message : '알 수 없는 오류'
        })
      }
    }

    return {
      success: true,
      message: '정기 주문 처리 완료',
      processedCount: results.length,
      results
    }

  } catch (error) {
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await processRecurringOrders()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: '정기 주문 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await processRecurringOrders()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: '정기 주문 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

async function checkExecutionCondition(order: any, today: Date): Promise<boolean> {
  
  if (!order.lastExecuted) {
    const startDate = new Date(order.startDate)
    const result = startDate <= today
    return result
  }

  const lastExecuted = new Date(order.lastExecuted)
  const startDate = new Date(order.startDate)

  switch (order.frequency) {
    case 'DAILY':
      const daysDiff = Math.floor((today.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60 * 24))
      const dailyResult = daysDiff >= 1
      return dailyResult
      
    case 'WEEKLY':
      const weekDiff = Math.floor((today.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60 * 24))
      const weeklyResult = weekDiff >= 7
      return weeklyResult
      
    case 'MONTHLY':
      const todayDay = today.getDate()
      const startDay = startDate.getDate()
      
      
      if (todayDay !== startDay) {
        return false
      }
      
      const lastExecutedMonth = lastExecuted.getMonth()
      const lastExecutedYear = lastExecuted.getFullYear()
      const todayMonth = today.getMonth()
      const todayYear = today.getFullYear()
      
      const monthlyResult = !(lastExecutedMonth === todayMonth && lastExecutedYear === todayYear)
      
      return monthlyResult
      
    default:
      return false
  }
}

async function getCurrentAssetPrice(asset: string): Promise<number | null> {
  try {
    
    const priceData = await prismaPrice.chartPrice.findFirst({
      where: {
        asset: asset
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!priceData) {
      return null
    }
    
    return priceData.price
    
  } catch (error) {
    return null
  }
}

async function sendFailureNotification(userId: string, failureType: 'balance' | 'holding', asset: string, quantity: number) {
  try {
    
    const assetNames: { [key: string]: string } = {
      'gold': '금',
      'silver': '은',
      'usd': '달러',
      'jpy': '엔화',
      'eur': '유로',
      'cny': '위안'
    }
    
    const assetName = assetNames[asset] || asset
    const unitLabel = asset === 'gold' || asset === 'silver' ? 'g' : ''
    
    let title = '정기 주문 실패'
    let message = ''
    
    if (failureType === 'balance') {
      message = `잔액이 부족하여 정기 주문이 체결되지 않았습니다. (${assetName} ${quantity}${unitLabel})`
    } else if (failureType === 'holding') {
      message = `보유량이 부족하여 정기 주문이 체결되지 않았습니다. (${assetName} ${quantity}${unitLabel})`
    }
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'RECURRING_ORDER_FAILED',
        title: title,
        message: message,
        data: JSON.stringify({
          asset: asset,
          quantity: quantity,
          failureType: failureType
        })
      }
    })
    
    const fcmToken = await prisma.fCMToken.findUnique({
      where: { userId: userId }
    })
    
    if (fcmToken && fcmToken.token) {
      await sendPushNotification(fcmToken.token, title, message, {
        type: 'RECURRING_ORDER_FAILED',
        asset: asset,
        quantity: quantity.toString(),
        failureType: failureType
      })
    } else {
    }
    
  } catch (error) {
  }
}
