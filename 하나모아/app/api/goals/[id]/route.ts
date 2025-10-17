import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { updateGoalParamsSchema, deleteGoalSchema } from '@/lib/api/validators/goal.schema'
import { goalService } from '@/lib/services/goal.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, updateGoalParamsSchema, async (request, data) => {
      try {
        const { id: goalId } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const goal = await goalService.updateGoal(goalId, data)

        return ApiResponse.success({ data: goal })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('목표 수정 중 오류가 발생했습니다')
      }
    })
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, deleteGoalSchema, async (request, data) => {
      try {
        const { id: goalId } = await params

        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await goalService.deleteGoal(goalId, data.userId)

        return ApiResponse.success({}, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('목표 삭제 중 오류가 발생했습니다')
      }
    })
  })
}
