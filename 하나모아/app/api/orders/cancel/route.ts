import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { cancelOrderSchema } from '@/lib/api/validators/order.schema'
import { orderService } from '@/lib/services/order.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, cancelOrderSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const order = await orderService.cancelOrder(data.orderId, data.userId)

        return ApiResponse.success(
          { order },
          '주문이 취소되었습니다'
        )
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('주문 취소 중 오류가 발생했습니다')
      }
    })
  })
}
