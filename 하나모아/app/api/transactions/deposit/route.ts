import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { depositSchema } from '@/lib/api/validators/transaction.schema'
import { transactionService } from '@/lib/services/transaction.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, depositSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const account = await transactionService.deposit(
          data.userId,
          data.accountId,
          data.amount
        )

        return ApiResponse.success(
          { account },
          '입금이 완료되었습니다'
        )
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('입금 처리 중 오류가 발생했습니다')
      }
    })
  })
}
