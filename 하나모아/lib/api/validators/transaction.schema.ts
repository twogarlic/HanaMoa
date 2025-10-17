import { z } from 'zod'

export const getTransactionsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  type: z.string().optional(),
  page: z.string().optional().transform((val: any) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val: any) => val ? parseInt(val) : 20)
})

export const depositSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  accountId: z.string().min(1, '계좌 ID가 필요합니다'),
  amount: z.number().positive('입금액은 0보다 커야 합니다')
})

export type GetTransactionsQuery = z.infer<typeof getTransactionsQuerySchema>
export type DepositInput = z.infer<typeof depositSchema>

