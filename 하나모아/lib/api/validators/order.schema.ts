import { z } from 'zod'

export const createOrderSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  accountId: z.string().min(1, '계좌 ID가 필요합니다'),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'], {
    errorMap: () => ({ message: '올바른 자산 유형을 선택해주세요' })
  }),
  orderType: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: '주문 유형은 buy 또는 sell이어야 합니다' })
  }),
  priceType: z.enum(['limit', 'market'], {
    errorMap: () => ({ message: '가격 유형은 limit 또는 market이어야 합니다' })
  }),
  limitPrice: z.number().positive('가격은 0보다 커야 합니다').optional().nullable(),
  quantity: z.number().positive('수량은 0보다 커야 합니다')
}).refine(
  (data: any) => data.priceType !== 'limit' || data.limitPrice,
  { message: '지정가 주문의 경우 limitPrice가 필요합니다' }
)

export const getOrdersQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  asset: z.string().optional(),
  page: z.string().optional().transform((val: any) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val: any) => val ? parseInt(val) : 10)
})

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, '주문 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

