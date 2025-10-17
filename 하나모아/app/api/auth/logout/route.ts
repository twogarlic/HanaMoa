import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  try {
    const response = ApiResponse.success({}, '로그아웃되었습니다')

    response.cookies.delete('auth_token')

    return response
  } catch (error) {
    return ApiResponse.serverError('로그아웃 중 오류가 발생했습니다')
  }
}
