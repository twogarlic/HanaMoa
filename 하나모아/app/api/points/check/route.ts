import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getPointBalanceQuerySchema } from '@/lib/api/validators/point.schema'
import { pointService } from '@/lib/services/point.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getPointBalanceQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await pointService.checkAccount(query.userId)

        return ApiResponse.success(result)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('포인트 계정 확인 중 오류가 발생했습니다')
      }
    })
  })
}
