import { z } from 'zod'

export const createRecurringOrderSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'], {
    errorMap: () => ({ message: '올바른 자산 유형을 선택해주세요' })
  }),
  orderType: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: '주문 유형은 buy 또는 sell이어야 합니다' })
  }),
  quantity: z.number().positive('수량은 0보다 커야 합니다'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'], {
    errorMap: () => ({ message: '올바른 주기를 선택해주세요' })
  }),
  startDate: z.string().min(1, '시작 날짜를 입력해주세요'),
  endDate: z.string().min(1, '종료 날짜를 입력해주세요')
}).refine(
  (data: any) => new Date(data.endDate) > new Date(data.startDate),
  { message: '종료일은 시작일보다 늦어야 합니다' }
)

export const getRecurringOrdersQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED']).optional()
})

export const cancelRecurringOrderSchema = z.object({
  orderId: z.string().min(1, '주문 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export type CreateRecurringOrderInput = z.infer<typeof createRecurringOrderSchema>
export type GetRecurringOrdersQuery = z.infer<typeof getRecurringOrdersQuerySchema>
export type CancelRecurringOrderInput = z.infer<typeof cancelRecurringOrderSchema>

