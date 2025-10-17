import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { voteSchema } from '@/lib/api/validators/poll.schema'
import { pollService } from '@/lib/services/poll.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, voteSchema, async (request, data) => {
      try {
        const { pollId } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await pollService.vote(pollId, data.userId, data.optionId)

        return ApiResponse.success({}, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('투표 처리 중 오류가 발생했습니다')
      }
    })
  })
}
