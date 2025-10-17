import { NextRequest } from 'next/server'
import { withAuth, optionalAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { createCommentSchema } from '@/lib/api/validators/community.schema'
import { communityService } from '@/lib/services/community.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return optionalAuth(request, async (request, userId) => {
    try {
      const { id } = await params

      const comments = await communityService.getComments(id)

      return ApiResponse.success({ data: comments })
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('댓글 조회 중 오류가 발생했습니다')
    }
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, createCommentSchema, async (request, data) => {
      try {
        const { id } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const comment = await communityService.createComment(id, data)

        return ApiResponse.success({ data: comment })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('댓글 작성 중 오류가 발생했습니다')
      }
    })
  })
}
