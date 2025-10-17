import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { socialLoginSchema } from '@/lib/api/validators/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/api/utils/response'
import { COOKIE_OPTIONS } from '@/lib/jwt'
import { ApiError } from '@/lib/api/utils/errors'

export async function POST(request: NextRequest) {
  return validateBody(request, socialLoginSchema, async (request, data) => {
    try {
      const result = await authService.socialLogin(data)

      if (result.isExistingUser && result.token) {
        const response = ApiResponse.success(
          {
            isExistingUser: true,
            user: result.user
          },
          '로그인에 성공했습니다'
        )
        response.cookies.set('auth_token', result.token, COOKIE_OPTIONS)
        return response
      }

      return ApiResponse.success({
        isExistingUser: false,
        socialUserInfo: result.socialUserInfo
      }, '회원가입이 필요합니다')

    } catch (error: any) {
      if (error instanceof ApiError) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('소셜 로그인 중 오류가 발생했습니다')
    }
  })
}
