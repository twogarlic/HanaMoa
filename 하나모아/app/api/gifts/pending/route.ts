import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody, validateQuery } from '@/lib/api/middleware/validation'
import { sendPendingGiftSchema, getPendingGiftsQuerySchema } from '@/lib/api/validators/gift.schema'
import { giftService } from '@/lib/services/gift.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, sendPendingGiftSchema, async (request, data) => {
      try {
        if (data.senderId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await giftService.sendPendingGift(data)

        return ApiResponse.success({
          id: result.id,
          message: '선물이 성공적으로 전송되었습니다. SMS로 알림이 발송됩니다.'
        })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('선물 전송 중 오류가 발생했습니다')
      }
    })
  })
}

export async function GET(request: NextRequest) {
  return validateQuery(request, getPendingGiftsQuerySchema, async (request, query) => {
    try {
      const gifts = await giftService.getPendingGifts(query.phone)

      return ApiResponse.success({ data: gifts })
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('선물 조회 중 오류가 발생했습니다')
    }
  })
}
