import { NextRequest } from 'next/server'
import { userRepository } from '@/lib/repositories/user.repository'
import { ApiResponse } from '@/lib/api/utils/response'
import { z } from 'zod'

const checkIdSchema = z.object({
  userId: z.string().min(1, '아이디를 입력해주세요')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = checkIdSchema.safeParse(body)

    if (!validated.success) {
      return ApiResponse.badRequest(validated.error.errors[0].message)
    }

    const existingUser = await userRepository.findByUserId(validated.data.userId)

    return ApiResponse.success({
      available: !existingUser,
      message: existingUser ? '이미 사용 중인 아이디입니다' : '사용 가능한 아이디입니다'
    })
  } catch (error) {
    return ApiResponse.serverError('아이디 확인 중 오류가 발생했습니다')
  }
}
