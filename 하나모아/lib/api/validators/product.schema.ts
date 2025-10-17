import { z } from 'zod'

export const getProductsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['popularity', 'price', 'rating']).optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
})

export const getProductByIdParamsSchema = z.object({
  id: z.string().min(1, '상품 ID가 필요합니다')
})

export const exchangeProductSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  productId: z.string().min(1, '상품 ID가 필요합니다'),
  quantity: z.number().int().positive('수량은 1 이상이어야 합니다')
})

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>
export type GetProductByIdParams = z.infer<typeof getProductByIdParamsSchema>
export type ExchangeProductInput = z.infer<typeof exchangeProductSchema>

