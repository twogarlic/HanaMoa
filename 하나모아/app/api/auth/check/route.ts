import { NextRequest } from 'next/server'
import { optionalAuth } from '@/lib/api/middleware/auth'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return optionalAuth(request, async (request, userId) => {
    try {
      if (!userId) {
        return ApiResponse.unauthorized('인증되지 않은 사용자입니다')
      }

      return ApiResponse.success({
        authenticated: true,
        userId
      })
    } catch (error) {
      return ApiResponse.serverError('인증 확인 중 오류가 발생했습니다')
    }
  })
}
