import { z } from 'zod'

export const checkAttendanceSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const getAttendanceQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  year: z.string().optional(),
  month: z.string().optional()
})

export type CheckAttendanceInput = z.infer<typeof checkAttendanceSchema>
export type GetAttendanceQuery = z.infer<typeof getAttendanceQuerySchema>

