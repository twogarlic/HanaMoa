import { orderRepository } from '@/lib/repositories/order.repository'
import { accountRepository } from '@/lib/repositories/account.repository'
import { holdingRepository } from '@/lib/repositories/holding.repository'
import prismaPrice from '@/lib/database-price'
import prisma from '@/lib/database'
import { sendPushNotification } from '@/lib/fcm'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import type { CreateOrderInput } from '@/lib/api/validators/order.schema'

export class OrderService {
  async createAndExecuteOrder(data: CreateOrderInput) {
    const account = await accountRepository.findById(data.accountId)
    
    if (!account) {
      throw new NotFoundError('계좌를 찾을 수 없습니다')
    }

    const realTimePrice = await prismaPrice.realTimePrice.findUnique({
      where: { asset: data.asset }
    })

    if (!realTimePrice) {
      throw new NotFoundError(`${data.asset} 자산의 실시간 가격을 찾을 수 없습니다`)
    }

    const currentPrice = data.asset === 'gold' ? realTimePrice.currentPrice / 100 : realTimePrice.currentPrice

    let shouldExecuteImmediately = true
    let executionPrice = currentPrice

    if (data.priceType === 'limit' && data.limitPrice) {
      const priceThreshold = 0.01
      const priceDiff = Math.abs(data.limitPrice - currentPrice)

      if (data.orderType === 'buy') {
        shouldExecuteImmediately = data.limitPrice >= currentPrice || priceDiff <= priceThreshold
        executionPrice = data.limitPrice
      } else {
        shouldExecuteImmediately = data.limitPrice <= currentPrice || priceDiff <= priceThreshold
        executionPrice = data.limitPrice
      }
    }

    if (data.orderType === 'buy') {
      const totalAmount = executionPrice * data.quantity
      if (account.balance < totalAmount) {
        throw new ValidationError('계좌 잔액이 부족합니다')
      }
    } else {
      const holding = await holdingRepository.findByUserIdAndAsset(data.userId, data.asset)

      if (!holding || holding.quantity < data.quantity) {
        throw new ValidationError('보유 자산이 부족합니다')
      }
    }

    const orderNumber = this.generateOrderNumber()
    const totalAmount = data.asset === 'gold'
      ? Math.round((executionPrice * data.quantity * 100) * 100) / 100
      : Math.round((executionPrice * data.quantity) * 100) / 100

    const order = await orderRepository.create({
      orderNumber,
      user: { connect: { id: data.userId } },
      account: { connect: { id: data.accountId } },
      asset: data.asset,
      orderType: data.orderType,
      priceType: data.priceType,
      limitPrice: data.limitPrice,
      quantity: data.quantity,
      totalAmount,
      status: shouldExecuteImmediately ? 'PENDING' : 'PENDING'
    })

    if (shouldExecuteImmediately) {
      await this.executeOrder(order.id, executionPrice, data.quantity, totalAmount, data)
      
      await this.sendOrderNotification(data.userId, data.asset, data.orderType, order.id)
    }

    return await orderRepository.findById(order.id)
  }

  async getOrders(userId: string, status?: string, asset?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      orderRepository.findByUserId(userId, { status, asset, skip, take: limit }),
      orderRepository.countByUserId(userId, status, asset)
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId)

    if (!order) {
      throw new NotFoundError('주문을 찾을 수 없습니다')
    }

    if (order.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    if (order.status !== 'PENDING') {
      throw new ValidationError('대기 중인 주문만 취소할 수 있습니다')
    }

    return await orderRepository.cancel(orderId)
  }

  private async executeOrder(
    orderId: string,
    executionPrice: number,
    quantity: number,
    totalAmount: number,
    data: CreateOrderInput
  ) {
    await prisma.execution.create({
      data: {
        orderId,
        executionPrice: Math.round(executionPrice * 100) / 100,
        executionQuantity: quantity,
        executionAmount: totalAmount
      }
    })

    await orderRepository.update(orderId, {
      status: 'COMPLETED',
      executedAt: new Date()
    })

    if (data.orderType === 'buy') {
      await this.processBuyOrder(data.userId, data.accountId, data.asset, quantity, executionPrice, totalAmount, orderId)
    } else {
      await this.processSellOrder(data.userId, data.accountId, data.asset, quantity, totalAmount, orderId)
    }
  }

  private async processBuyOrder(
    userId: string,
    accountId: string,
    asset: string,
    quantity: number,
    executionPrice: number,
    totalAmount: number,
    orderId: string
  ) {
    const updatedAccount = await accountRepository.updateBalance(accountId, Math.round(totalAmount * 100) / 100, 'decrement')

    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'ORDER_BUY',
        amount: -Math.round(totalAmount * 100) / 100,
        balance: updatedAccount.balance,
        description: `${asset.toUpperCase()} 구매`,
        referenceId: orderId
      }
    })

    const existingHolding = await holdingRepository.findByUserIdAndAsset(userId, asset)

    if (existingHolding) {
      const newTotalQuantity = this.roundToTwoDecimals(existingHolding.quantity + quantity)
      const newTotalAmount = this.roundToTwoDecimals(existingHolding.totalAmount + totalAmount)
      const newAveragePrice = this.roundToTwoDecimals(
        (existingHolding.averagePrice * existingHolding.quantity + executionPrice * quantity) / newTotalQuantity
      )

      await holdingRepository.update(userId, asset, {
        quantity: newTotalQuantity,
        averagePrice: newAveragePrice,
        totalAmount: newTotalAmount
      })
    } else {
      await holdingRepository.create({
        user: { connect: { id: userId } },
        asset,
        quantity: this.roundToTwoDecimals(quantity),
        averagePrice: this.roundToTwoDecimals(executionPrice),
        totalAmount: this.roundToTwoDecimals(totalAmount)
      })
    }
  }

  private async processSellOrder(
    userId: string,
    accountId: string,
    asset: string,
    quantity: number,
    totalAmount: number,
    orderId: string
  ) {
    const updatedAccount = await accountRepository.updateBalance(accountId, Math.round(totalAmount * 100) / 100, 'increment')

    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'ORDER_SELL',
        amount: Math.round(totalAmount * 100) / 100,
        balance: updatedAccount.balance,
        description: `${asset.toUpperCase()} 판매`,
        referenceId: orderId
      }
    })

    const holding = await holdingRepository.findByUserIdAndAsset(userId, asset)

    if (holding) {
      const newQuantity = this.roundToTwoDecimals(holding.quantity - quantity)
      const newTotalAmount = this.roundToTwoDecimals(newQuantity * holding.averagePrice)

      if (newQuantity > 0) {
        await holdingRepository.update(userId, asset, {
          quantity: newQuantity,
          totalAmount: newTotalAmount
        })
      } else {
        await holdingRepository.delete(userId, asset)
      }
    }
  }

  private async sendOrderNotification(userId: string, asset: string, orderType: string, orderId: string) {
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
          orderId,
          asset,
          orderType
        }
      )
    } catch (error) {
      
    }
  }

  private generateOrderNumber(): string {
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

  private roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100
  }
}

export const orderService = new OrderService()

