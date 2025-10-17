import { z } from 'zod'

export const createPollSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  options: z.array(z.string()).min(2, '최소 2개의 선택지가 필요합니다'),
  isMultiple: z.boolean().optional(),
  endDate: z.string().optional()
})

export const voteSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  optionId: z.string().min(1, '선택지 ID가 필요합니다')
})

export type CreatePollInput = z.infer<typeof createPollSchema>
export type VoteInput = z.infer<typeof voteSchema>

