import { NextRequest } from 'next/server'
import { validateQuery } from '@/lib/api/middleware/validation'
import { getProductsQuerySchema } from '@/lib/api/validators/product.schema'
import { productService } from '@/lib/services/product.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return validateQuery(request, getProductsQuerySchema, async (request, query) => {
    try {
      const result = await productService.getProducts(query)

      return ApiResponse.success(result)
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('상품 조회에 실패했습니다')
    }
  })
}
