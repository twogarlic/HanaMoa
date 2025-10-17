import { NextRequest, NextResponse } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { loginSchema } from '@/lib/api/validators/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/api/utils/response'
import { COOKIE_OPTIONS } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  return validateBody(request, loginSchema, async (request, data) => {
    try {
      const result = await authService.login(data)

      const response = ApiResponse.success(
        { user: result.user },
        '로그인에 성공했습니다'
      )

      response.cookies.set('auth_token', result.token, COOKIE_OPTIONS)

      return response
    } catch (error: any) {
      if (error.statusCode === 401) {
        return ApiResponse.unauthorized(error.message)
      }
      return ApiResponse.serverError('로그인 중 오류가 발생했습니다')
    }
  })
}
