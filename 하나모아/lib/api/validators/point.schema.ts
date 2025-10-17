import { z } from 'zod'

export const getPointBalanceQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const earnPointSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  amount: z.number().positive('포인트는 0보다 커야 합니다'),
  description: z.string().min(1, '설명이 필요합니다')
})

export const usePointSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  amount: z.number().positive('포인트는 0보다 커야 합니다'),
  description: z.string().min(1, '설명이 필요합니다')
})

export const linkPointSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  name: z.string().min(1, '이름이 필요합니다'),
  ssn: z.string().min(1, '주민등록번호가 필요합니다'),
  phone: z.string().min(1, '전화번호가 필요합니다')
})

export const getPointHistoryQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  page: z.string().optional().transform((val: any) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val: any) => val ? parseInt(val) : 20)
})

export type GetPointBalanceQuery = z.infer<typeof getPointBalanceQuerySchema>
export type EarnPointInput = z.infer<typeof earnPointSchema>
export type UsePointInput = z.infer<typeof usePointSchema>
export type LinkPointInput = z.infer<typeof linkPointSchema>
export type GetPointHistoryQuery = z.infer<typeof getPointHistoryQuerySchema>

