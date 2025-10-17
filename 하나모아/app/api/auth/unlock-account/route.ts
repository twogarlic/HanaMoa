import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { z } from 'zod'
import { userRepository } from '@/lib/repositories/user.repository'
import { ApiResponse } from '@/lib/api/utils/response'

const unlockAccountSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export async function POST(request: NextRequest) {
  return validateBody(request, unlockAccountSchema, async (request, data) => {
    try {
      const user = await userRepository.findByUserId(data.userId)

      if (!user) {
        return ApiResponse.notFound('존재하지 않는 계정입니다')
      }

      await userRepository.unlockAccount(data.userId)

      return ApiResponse.success({}, '계정 잠금이 해제되었습니다')
    } catch (error) {
      return ApiResponse.serverError('계정 잠금 해제 중 오류가 발생했습니다')
    }
  })
}
