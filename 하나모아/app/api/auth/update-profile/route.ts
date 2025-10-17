import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { userRepository } from '@/lib/repositories/user.repository'
import { ApiResponse } from '@/lib/api/utils/response'
import { z } from 'zod'

const updateProfileSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  name: z.string().optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  isPublicProfile: z.boolean().optional(),
  isPostsPublic: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    try {
      const body = await request.json()
      const validated = updateProfileSchema.safeParse(body)

      if (!validated.success) {
        return ApiResponse.badRequest(validated.error.errors[0].message)
      }

      const data = validated.data

      if (data.userId !== authenticatedUserId) {
        return ApiResponse.forbidden('권한이 없습니다')
      }

      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage
      if (data.isPublicProfile !== undefined) updateData.isPublicProfile = data.isPublicProfile
      if (data.isPostsPublic !== undefined) updateData.isPostsPublic = data.isPostsPublic
      if (data.notificationsEnabled !== undefined) updateData.notificationsEnabled = data.notificationsEnabled

      const updatedUser = await userRepository.update(data.userId, updateData)

      return ApiResponse.success(
        { user: updatedUser },
        '프로필이 업데이트되었습니다'
      )
    } catch (error) {
      return ApiResponse.serverError('프로필 업데이트 중 오류가 발생했습니다')
    }
  })
}
