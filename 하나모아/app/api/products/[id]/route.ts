import { NextRequest } from 'next/server'
import { productService } from '@/lib/services/product.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const product = await productService.getProductById(productId)

    return ApiResponse.success({ product })
  } catch (error: any) {
    if (error.statusCode === 404) {
      return ApiResponse.notFound(error.message)
    }
    return ApiResponse.serverError('상품 조회에 실패했습니다')
  }
}
