import { z } from 'zod'

export const getHoldingsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const getUserHoldingQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  asset: z.string().optional()
})

export type GetHoldingsQuery = z.infer<typeof getHoldingsQuerySchema>
export type GetUserHoldingQuery = z.infer<typeof getUserHoldingQuerySchema>

