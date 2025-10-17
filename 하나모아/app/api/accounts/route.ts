import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { accountRepository } from '@/lib/repositories/account.repository'
import { ApiResponse } from '@/lib/api/utils/response'
import { z } from 'zod'

const getAccountsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    try {
      const { searchParams } = new URL(request.url)
      const queryObject = Object.fromEntries(searchParams.entries())
      
      const validated = getAccountsQuerySchema.safeParse(queryObject)
      
      if (!validated.success) {
        return ApiResponse.badRequest(validated.error.errors[0].message)
      }

      if (validated.data.userId !== authenticatedUserId) {
        return ApiResponse.forbidden('권한이 없습니다')
      }

      const accounts = await accountRepository.findByUserId(validated.data.userId)

      return ApiResponse.success({ data: accounts })
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('계좌 조회 중 오류가 발생했습니다')
    }
  })
}
