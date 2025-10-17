import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { changePasswordSchema } from '@/lib/api/validators/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, changePasswordSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        await authService.changePassword(
          data.userId,
          data.currentPassword,
          data.newPassword
        )

        return ApiResponse.success({}, '비밀번호가 변경되었습니다')
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('비밀번호 변경 중 오류가 발생했습니다')
      }
    })
  })
}
