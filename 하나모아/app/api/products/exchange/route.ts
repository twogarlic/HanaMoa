import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateBody } from '@/lib/api/middleware/validation'
import { exchangeProductSchema } from '@/lib/api/validators/product.schema'
import { productService } from '@/lib/services/product.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, exchangeProductSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const result = await productService.exchangeProduct(
          data.userId,
          data.productId,
          data.quantity
        )

        return ApiResponse.success(result, result.message)
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('교환 처리 중 오류가 발생했습니다')
      }
    })
  })
}
