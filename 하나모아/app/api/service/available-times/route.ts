import { NextRequest } from 'next/server'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getAvailableTimesQuerySchema } from '@/lib/api/validators/service.schema'
import { serviceService } from '@/lib/services/service.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return validateQuery(request, getAvailableTimesQuerySchema, async (request, query) => {
    try {
      const availableTimes = await serviceService.getAvailableTimes(
        query.branchId,
        query.date
      )

      return ApiResponse.success({ data: availableTimes })
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('예약 가능 시간 조회 중 오류가 발생했습니다')
    }
  })
}
