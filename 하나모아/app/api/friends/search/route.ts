import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { searchFriendQuerySchema } from '@/lib/api/validators/friend.schema'
import { userRepository } from '@/lib/repositories/user.repository'
import { friendRepository } from '@/lib/repositories/friend.repository'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, searchFriendQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const formatPhoneForSearch = (phoneNumber: string) => {
          const numbers = phoneNumber.replace(/[^0-9]/g, '')
          if (numbers.length === 11) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
          }
          return phoneNumber
        }

        const formattedPhone = formatPhoneForSearch(query.phone)

        const user = await userRepository.findByPhone(formattedPhone)

        if (!user) {
          return ApiResponse.notFound('해당 전화번호로 가입된 사용자를 찾을 수 없습니다')
        }

        if (user.id === query.userId) {
          return ApiResponse.badRequest('자기 자신을 친구로 추가할 수 없습니다')
        }

        const existingFriend = await friendRepository.findByUserIdAndFriendId(query.userId, user.id)

        const existingRequest = await friendRepository.findRequestById(user.id)

        return ApiResponse.success({
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            profileImage: user.profileImage
          },
          isAlreadyFriend: !!existingFriend,
          hasPendingRequest: !!existingRequest,
          requestStatus: existingRequest?.status || null
        })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('친구 검색에 실패했습니다')
      }
    })
  })
}
