import { NextRequest } from 'next/server'
import { withAuth, optionalAuth } from '@/lib/api/middleware/auth'
import { communityService } from '@/lib/services/community.service'
import { ApiResponse } from '@/lib/api/utils/response'
import { z } from 'zod'

const deletePostSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return optionalAuth(request, async (request, userId) => {
    try {
      const { id } = await params

      const post = await communityService.getPost(id)

      return ApiResponse.success({ data: post })
    } catch (error: any) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(error.message)
      }
      return ApiResponse.serverError('게시글 조회 중 오류가 발생했습니다')
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    try {
      const { id } = await params
      const body = await request.json()
      const validated = deletePostSchema.safeParse(body)

      if (!validated.success) {
        return ApiResponse.badRequest(validated.error.errors[0].message)
      }

      if (validated.data.userId !== authenticatedUserId) {
        return ApiResponse.forbidden('권한이 없습니다')
      }

      await communityService.deletePost(id, validated.data.userId)

      return ApiResponse.success({}, '게시글이 삭제되었습니다')
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('게시글 삭제 중 오류가 발생했습니다')
    }
  })
}
