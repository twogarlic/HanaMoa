import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { friendRequestActionSchema } from '@/lib/api/validators/friend.schema'
import { friendService } from '@/lib/services/friend.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, friendRequestActionSchema, async (request, data) => {
      try {
        const { id } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await friendService.handleFriendRequest(id, data)

        return ApiResponse.success({}, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('친구 신청 처리에 실패했습니다')
      }
    })
  })
}
