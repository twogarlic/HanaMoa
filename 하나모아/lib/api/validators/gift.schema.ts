import { z } from 'zod'

export const sendPendingGiftSchema = z.object({
  senderId: z.string().min(1, '발신자 ID가 필요합니다'),
  receiverPhone: z.string().min(1, '수신자 전화번호가 필요합니다'),
  receiverName: z.string().optional(),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'], {
    errorMap: () => ({ message: '올바른 자산 유형을 선택해주세요' })
  }),
  quantity: z.number().positive('수량은 0보다 커야 합니다'),
  messageCard: z.string().optional(),
  message: z.string().optional()
})

export const getPendingGiftsQuerySchema = z.object({
  phone: z.string().min(1, '전화번호가 필요합니다')
})

export const giftActionSchema = z.object({
  action: z.enum(['accept', 'decline'], {
    errorMap: () => ({ message: '올바른 액션을 선택해주세요' })
  }),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const getGiftsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  type: z.enum(['sent', 'received']).optional()
})

export type SendPendingGiftInput = z.infer<typeof sendPendingGiftSchema>
export type GetPendingGiftsQuery = z.infer<typeof getPendingGiftsQuerySchema>
export type GiftActionInput = z.infer<typeof giftActionSchema>
export type GetGiftsQuery = z.infer<typeof getGiftsQuerySchema>

