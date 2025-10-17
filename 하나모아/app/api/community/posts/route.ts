import { NextRequest } from 'next/server'
import { optionalAuth } from '@/lib/api/middleware/auth'
import { validateQuery, validateBody } from '@/lib/api/middleware/validation'
import { getPostsQuerySchema, createPostSchema } from '@/lib/api/validators/community.schema'
import { communityService } from '@/lib/services/community.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return optionalAuth(request, async (request, userId) => {
    return validateQuery(request, getPostsQuerySchema, async (request, query) => {
      try {
        const result = await communityService.getPosts(
          query.page || 1,
          query.limit || 10,
          query.sortBy,
          query.asset
        )

        return ApiResponse.success(result)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('게시글 목록 조회 중 오류가 발생했습니다')
      }
    })
  })
}

export async function POST(request: NextRequest) {
  return validateBody(request, createPostSchema, async (request, data) => {
    try {
      const post = await communityService.createPost(data)

      return ApiResponse.success({ data: post })
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('게시글 작성 중 오류가 발생했습니다')
    }
  })
}
