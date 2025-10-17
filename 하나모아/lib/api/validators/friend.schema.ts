import { z } from 'zod'

export const getFriendsQuerySchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const addFriendSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  friendName: z.string().min(1, '친구 이름을 입력해주세요'),
  friendPhone: z.string().min(1, '친구 전화번호를 입력해주세요')
})

export const friendRequestActionSchema = z.object({
  action: z.enum(['accept', 'decline'], {
    errorMap: () => ({ message: '올바른 액션을 선택해주세요' })
  }),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const searchFriendQuerySchema = z.object({
  phone: z.string().min(1, '전화번호가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export type GetFriendsQuery = z.infer<typeof getFriendsQuerySchema>
export type AddFriendInput = z.infer<typeof addFriendSchema>
export type FriendRequestActionInput = z.infer<typeof friendRequestActionSchema>
export type SearchFriendQuery = z.infer<typeof searchFriendQuerySchema>
