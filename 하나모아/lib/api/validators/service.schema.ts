import { z } from 'zod'

export const requestServiceSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  branchId: z.string().min(1, '지점 ID가 필요합니다'),
  branchName: z.string().min(1, '지점명이 필요합니다'),
  branchAddress: z.string().optional(),
  branchPhone: z.string().optional(),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'], {
    errorMap: () => ({ message: '올바른 자산 유형을 선택해주세요' })
  }),
  requestDate: z.string().optional(),
  reservationDate: z.string().min(1, '예약 날짜가 필요합니다'),
  reservationTime: z.string().min(1, '예약 시간이 필요합니다')
})

export const getAvailableTimesQuerySchema = z.object({
  branchId: z.string().min(1, '지점 ID가 필요합니다'),
  date: z.string().min(1, '날짜가 필요합니다')
})

export const cancelServiceSchema = z.object({
  serviceId: z.string().min(1, '예약 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const completeServiceSchema = z.object({
  serviceId: z.string().min(1, '예약 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const payServiceFeeSchema = z.object({
  serviceId: z.string().min(1, '예약 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  amount: z.number().positive('수수료는 0보다 커야 합니다')
})

export type RequestServiceInput = z.infer<typeof requestServiceSchema>
export type GetAvailableTimesQuery = z.infer<typeof getAvailableTimesQuerySchema>
export type CancelServiceInput = z.infer<typeof cancelServiceSchema>
export type CompleteServiceInput = z.infer<typeof completeServiceSchema>
export type PayServiceFeeInput = z.infer<typeof payServiceFeeSchema>

