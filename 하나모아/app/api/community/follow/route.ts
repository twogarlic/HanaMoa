import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { followUserSchema } from '@/lib/api/validators/community.schema'
import { communityService } from '@/lib/services/community.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, followUserSchema, async (request, data) => {
      try {
        if (data.followerId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await communityService.followUser(data)

        return ApiResponse.success(result, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('팔로우 처리 중 오류가 발생했습니다')
      }
    })
  })
}
