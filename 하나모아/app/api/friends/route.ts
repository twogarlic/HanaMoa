import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery, validateBody } from '@/lib/api/middleware/validation'
import { getFriendsQuerySchema, addFriendSchema } from '@/lib/api/validators/friend.schema'
import { friendService } from '@/lib/services/friend.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getFriendsQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const friends = await friendService.getFriends(query.userId)

        return ApiResponse.success({ data: friends })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('친구 목록을 불러오는데 실패했습니다')
      }
    })
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, addFriendSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const friend = await friendService.addFriend(data)

        return ApiResponse.success(
          { data: friend },
          '친구가 추가되었습니다'
        )
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('친구 추가에 실패했습니다')
      }
    })
  })
}
