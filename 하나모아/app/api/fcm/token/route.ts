import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { ApiResponse } from '@/lib/api/utils/response'
import prisma from '@/lib/database'

export async function POST(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    try {
      const body = await request.json()
      const { userId, fcmToken } = body

      if (!userId || !fcmToken) {
        return ApiResponse.badRequest('사용자 ID와 FCM 토큰이 필요합니다')
      }

      if (userId !== authenticatedUserId) {
        return ApiResponse.forbidden('권한이 없습니다')
      }

      await prisma.fCMToken.upsert({
        where: { userId },
        update: { token: fcmToken },
        create: { userId, token: fcmToken }
      })

      return ApiResponse.success({}, 'FCM 토큰이 저장되었습니다')
    } catch (error) {
      return ApiResponse.serverError('FCM 토큰 저장에 실패했습니다')
    }
  })
}
