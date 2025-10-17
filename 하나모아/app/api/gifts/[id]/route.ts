import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { giftActionSchema } from '@/lib/api/validators/gift.schema'
import { giftService } from '@/lib/services/gift.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, giftActionSchema, async (request, data) => {
      try {
        const { id } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await giftService.handleGiftAction(id, data)

        return ApiResponse.success({}, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('선물 처리 중 오류가 발생했습니다')
      }
    })
  })
}
