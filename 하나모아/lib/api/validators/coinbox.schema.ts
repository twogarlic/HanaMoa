import { z } from 'zod'

export const createCoinboxSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  targetAmount: z.number().positive('목표 금액은 0보다 커야 합니다'),
  dailyAmount: z.number().positive('일일 적립액은 0보다 커야 합니다'),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'], {
    errorMap: () => ({ message: '올바른 자산 유형을 선택해주세요' })
  })
})

export const getCoinboxQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const toggleCoinboxSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  coinboxId: z.string().min(1, '저금통 ID가 필요합니다')
})

export const emptyCoinboxSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  coinboxId: z.string().min(1, '저금통 ID가 필요합니다')
})

export type CreateCoinboxInput = z.infer<typeof createCoinboxSchema>
export type GetCoinboxQuery = z.infer<typeof getCoinboxQuerySchema>
export type ToggleCoinboxInput = z.infer<typeof toggleCoinboxSchema>
export type EmptyCoinboxInput = z.infer<typeof emptyCoinboxSchema>

