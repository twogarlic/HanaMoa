import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getOrdersQuerySchema } from '@/lib/api/validators/order.schema'
import { orderService } from '@/lib/services/order.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getOrdersQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await orderService.getOrders(
          query.userId,
          query.status,
          query.asset,
          query.page,
          query.limit
        )

        return ApiResponse.success(result)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('주문 목록 조회 중 오류가 발생했습니다')
      }
    })
  })
}
