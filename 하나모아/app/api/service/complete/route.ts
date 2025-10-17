import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { completeServiceSchema } from '@/lib/api/validators/service.schema'
import { serviceService } from '@/lib/services/service.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, completeServiceSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const service = await serviceService.completeService(data.serviceId, data.userId)

        return ApiResponse.success(
          { data: service },
          '서비스가 완료되었습니다'
        )
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('서비스 완료 처리 중 오류가 발생했습니다')
      }
    })
  })
}
