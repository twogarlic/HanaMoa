import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getTransactionsQuerySchema } from '@/lib/api/validators/transaction.schema'
import { transactionService } from '@/lib/services/transaction.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getTransactionsQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await transactionService.getTransactions(
          query.userId,
          query.type,
          query.page,
          query.limit
        )

        return ApiResponse.success(result)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('거래 내역 조회 중 오류가 발생했습니다')
      }
    })
  })
}
