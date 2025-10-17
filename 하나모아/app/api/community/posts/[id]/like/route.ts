import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { likePostSchema } from '@/lib/api/validators/community.schema'
import { communityService } from '@/lib/services/community.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, likePostSchema, async (request, data) => {
      try {
        const { id } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await communityService.likePost(id, data.userId)

        return ApiResponse.success(result, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('좋아요 처리 중 오류가 발생했습니다')
      }
    })
  })
}
