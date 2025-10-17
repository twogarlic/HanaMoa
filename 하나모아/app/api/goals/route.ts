import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery, validateBody } from '@/lib/api/middleware/validation'
import { getGoalsQuerySchema, createGoalSchema } from '@/lib/api/validators/goal.schema'
import { goalService } from '@/lib/services/goal.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getGoalsQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const goals = await goalService.getGoals(query.userId, query.status)

        return ApiResponse.success({ data: goals })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('목표 목록 조회 중 오류가 발생했습니다')
      }
    })
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, createGoalSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const goal = await goalService.createGoal(data)

        return ApiResponse.success({ data: goal })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('목표 생성 중 오류가 발생했습니다')
      }
    })
  })
}
