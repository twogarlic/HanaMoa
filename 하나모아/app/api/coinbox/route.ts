import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getCoinboxQuerySchema } from '@/lib/api/validators/coinbox.schema'
import { coinboxService } from '@/lib/services/coinbox.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getCoinboxQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const coinboxes = await coinboxService.getCoinboxes(query.userId)

        return ApiResponse.success({ data: coinboxes })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('저금통 조회 중 오류가 발생했습니다')
      }
    })
  })
}
