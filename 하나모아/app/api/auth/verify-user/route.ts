import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { z } from 'zod'
import { userRepository } from '@/lib/repositories/user.repository'
import { ApiResponse } from '@/lib/api/utils/response'

const verifyUserSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  phone: z.string().min(1, '전화번호가 필요합니다')
})

export async function POST(request: NextRequest) {
  return validateBody(request, verifyUserSchema, async (request, data) => {
    try {
      const user = await userRepository.findByUserId(data.userId)

      if (!user) {
        return ApiResponse.notFound('가입되지 않은 아이디입니다')
      }

      if (user.phone !== data.phone) {
        return ApiResponse.badRequest('해당 아이디에 등록된 전화번호가 아닙니다')
      }

      return ApiResponse.success({}, '사용자 정보가 확인되었습니다')
    } catch (error) {
      return ApiResponse.serverError('사용자 확인 중 오류가 발생했습니다')
    }
  })
}
