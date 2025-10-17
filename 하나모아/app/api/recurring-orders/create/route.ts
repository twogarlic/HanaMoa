import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { createRecurringOrderSchema } from '@/lib/api/validators/recurring-order.schema'
import { recurringOrderService } from '@/lib/services/recurring-order.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, createRecurringOrderSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const order = await recurringOrderService.createRecurringOrder(data)

        return ApiResponse.success(
          { order },
          '정기 주문이 생성되었습니다'
        )
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('정기 주문 생성 중 오류가 발생했습니다')
      }
    })
  })
}
