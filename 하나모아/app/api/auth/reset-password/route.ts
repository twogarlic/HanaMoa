import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { resetPasswordSchema } from '@/lib/api/validators/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return validateBody(request, resetPasswordSchema, async (request, data) => {
    try {
      await authService.resetPassword(
        data.userId,
        data.ssn,
        data.newPassword
      )

      return ApiResponse.success({}, '비밀번호가 재설정되었습니다')
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('비밀번호 재설정 중 오류가 발생했습니다')
    }
  })
}
