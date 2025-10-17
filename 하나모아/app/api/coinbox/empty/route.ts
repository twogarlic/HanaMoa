import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { emptyCoinboxSchema } from '@/lib/api/validators/coinbox.schema'
import { coinboxService } from '@/lib/services/coinbox.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, emptyCoinboxSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await coinboxService.emptyCoinbox(data.coinboxId, data.userId)

        return ApiResponse.success({}, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('저금통 비우기 중 오류가 발생했습니다')
      }
    })
  })
}
