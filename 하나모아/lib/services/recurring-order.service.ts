import { recurringOrderRepository } from '@/lib/repositories/recurring-order.repository'
import { holdingRepository } from '@/lib/repositories/holding.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import type { CreateRecurringOrderInput } from '@/lib/api/validators/recurring-order.schema'

export class RecurringOrderService {
  async createRecurringOrder(data: CreateRecurringOrderInput) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    if (start >= end) {
      throw new ValidationError('종료일은 시작일보다 늦어야 합니다')
    }

    if (data.orderType === 'sell') {
      const holding = await holdingRepository.findByUserIdAndAsset(data.userId, data.asset)

      if (!holding || holding.quantity < data.quantity) {
        throw new ValidationError('보유량이 부족합니다')
      }
    }

    return await recurringOrderRepository.create({
      user: { connect: { id: data.userId } },
      asset: data.asset,
      orderType: data.orderType,
      quantity: data.quantity,
      frequency: data.frequency,
      startDate: start,
      endDate: end,
      status: 'ACTIVE',
      lastExecutedAt: null,
      nextExecutionAt: start
    })
  }

  async getRecurringOrders(userId: string, status?: string) {
    return await recurringOrderRepository.findByUserId(userId, status)
  }

  async cancelRecurringOrder(orderId: string, userId: string) {
    const order = await recurringOrderRepository.findById(orderId)

    if (!order) {
      throw new NotFoundError('정기 주문을 찾을 수 없습니다')
    }

    if (order.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    if (order.status !== 'ACTIVE') {
      throw new ValidationError('활성 상태인 정기 주문만 취소할 수 있습니다')
    }

    return await recurringOrderRepository.cancel(orderId)
  }
}

export const recurringOrderService = new RecurringOrderService()

