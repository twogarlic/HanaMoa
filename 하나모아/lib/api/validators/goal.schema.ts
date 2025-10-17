import { z } from 'zod'

export const createGoalSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  title: z.string().min(1, '목표 제목을 입력해주세요'),
  targetAmount: z.number().positive('목표 금액은 0보다 커야 합니다'),
  startDate: z.string().min(1, '시작 날짜를 입력해주세요'),
  targetDate: z.string().min(1, '목표 날짜를 입력해주세요'),
  asset: z.string().min(1, '자산을 선택해주세요'),
  description: z.string().optional().nullable(),
  color: z.string().optional()
}).refine(
  (data: any) => new Date(data.targetDate) > new Date(data.startDate),
  { message: '목표 날짜는 시작 날짜보다 늦어야 합니다' }
)

export const getGoalsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional()
})

export const updateGoalParamsSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  title: z.string().min(1, '목표 제목을 입력해주세요'),
  targetAmount: z.number().positive('목표 금액은 0보다 커야 합니다'),
  startDate: z.string().min(1, '시작 날짜를 입력해주세요'),
  targetDate: z.string().min(1, '목표 날짜를 입력해주세요'),
  asset: z.string().min(1, '자산을 선택해주세요'),
  description: z.string().optional().nullable(),
  color: z.string().optional()
}).refine(
  (data: any) => new Date(data.targetDate) > new Date(data.startDate),
  { message: '목표 날짜는 시작 날짜보다 늦어야 합니다' }
)

export const deleteGoalSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type GetGoalsQuery = z.infer<typeof getGoalsQuerySchema>
export type UpdateGoalParams = z.infer<typeof updateGoalParamsSchema>
export type DeleteGoalInput = z.infer<typeof deleteGoalSchema>
