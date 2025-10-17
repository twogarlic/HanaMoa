import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getGiftsQuerySchema } from '@/lib/api/validators/gift.schema'
import { giftService } from '@/lib/services/gift.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getGiftsQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const gifts = await giftService.getGifts(query.userId, query.type)

        return ApiResponse.success({ data: gifts })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('선물 목록 조회 중 오류가 발생했습니다')
      }
    })
  })
}
