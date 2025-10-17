import { z } from 'zod'

export const getPostsQuerySchema = z.object({
  page: z.string().optional().transform((val: any) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val: any) => val ? parseInt(val) : 10),
  sortBy: z.enum(['latest', 'popular']).optional(),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny']).optional()
})

export const createPostSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  content: z.string().optional(),
  asset: z.enum(['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'], {
    errorMap: () => ({ message: '올바른 자산 유형을 선택해주세요' })
  }),
  pollData: z.any().optional()
})

export const likePostSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다')
})

export const createCommentSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  content: z.string().min(1, '내용을 입력해주세요'),
  parentCommentId: z.string().optional()
})

export const followUserSchema = z.object({
  followerId: z.string().min(1, '팔로워 ID가 필요합니다'),
  followingId: z.string().min(1, '팔로잉 ID가 필요합니다')
})

export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type LikePostInput = z.infer<typeof likePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type FollowUserInput = z.infer<typeof followUserSchema>

