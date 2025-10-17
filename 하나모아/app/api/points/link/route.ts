import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { linkPointSchema } from '@/lib/api/validators/point.schema'
import { pointService } from '@/lib/services/point.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return validateBody(request, linkPointSchema, async (request, data) => {
    try {
      const result = await pointService.linkAccount(data)

      return ApiResponse.success(result, result.message)
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('포인트 계정 연결 중 오류가 발생했습니다')
    }
  })
}
