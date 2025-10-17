import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { findIdSchema } from '@/lib/api/validators/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return validateBody(request, findIdSchema, async (request, data) => {
    try {
      const result = await authService.findUserId(
        data.name,
        data.ssn,
        data.phone
      )

      return ApiResponse.success(result, '아이디를 찾았습니다')
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('아이디 찾기 중 오류가 발생했습니다')
    }
  })
}
