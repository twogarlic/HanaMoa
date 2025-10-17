import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getUserHoldingQuerySchema } from '@/lib/api/validators/holding.schema'
import { holdingService } from '@/lib/services/holding.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getUserHoldingQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        if (query.asset) {
          const holding = await holdingService.getUserHoldingsByAsset(query.userId, query.asset)
          return ApiResponse.success({ data: holding })
        }

        const holdings = await holdingService.getUserHoldings(query.userId)
        return ApiResponse.success({ data: holdings })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('보유 자산 조회 중 오류가 발생했습니다')
      }
    })
  })
}
