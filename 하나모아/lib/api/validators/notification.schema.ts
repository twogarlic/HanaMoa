import { z } from 'zod'

export const getNotificationsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const markAsReadSchema = z.object({
  notificationId: z.string().min(1, '알림 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>

