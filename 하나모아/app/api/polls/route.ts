import { NextRequest } from 'next/server'
import { pollService } from '@/lib/services/poll.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  try {
    const polls = await pollService.getPolls()

    return ApiResponse.success({ data: polls })
  } catch (error: any) {
    if (error.statusCode) {
      return ApiResponse.error(error.message, error.statusCode)
    }
    return ApiResponse.serverError('투표 목록 조회 중 오류가 발생했습니다')
  }
}
