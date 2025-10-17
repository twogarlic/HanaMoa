import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { transactionService } from '@/lib/services/transaction.service'
import { ApiResponse } from '@/lib/api/utils/response'
import { z } from 'zod'

const querySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  page: z.string().optional().transform((val: any) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val: any) => val ? parseInt(val) : 20)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  return withAuth(request, async (request, authenticatedUserId) => {
    try {
      const { accountId } = await params
      const { searchParams } = new URL(request.url)
      const queryObject = Object.fromEntries(searchParams.entries())
      
      const validated = querySchema.safeParse(queryObject)
      
      if (!validated.success) {
        return ApiResponse.badRequest(validated.error.errors[0].message)
      }

      const query = validated.data

      if (query.userId !== authenticatedUserId) {
        return ApiResponse.forbidden('권한이 없습니다')
      }

      const result = await transactionService.getAccountTransactions(
        accountId,
        query.userId,
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
}
