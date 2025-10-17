import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware/auth'
import { validateQuery, validateBody } from '@/lib/api/middleware/validation'
import { getNotificationsQuerySchema, markAsReadSchema } from '@/lib/api/validators/notification.schema'
import { notificationService } from '@/lib/services/notification.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateQuery(request, getNotificationsQuerySchema, async (request, query) => {
      try {
        if (query.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        const notifications = await notificationService.getNotifications(query.userId)

        return ApiResponse.success({ data: notifications })
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('알림 조회 중 오류가 발생했습니다')
      }
    })
  })
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (request, authenticatedUserId) => {
    return validateBody(request, markAsReadSchema, async (request, data) => {
      try {
        if (data.userId !== authenticatedUserId) {
          return ApiResponse.forbidden('권한이 없습니다')
        }

        await notificationService.markAsRead(data.notificationId, data.userId)

        return ApiResponse.success({}, '알림을 읽음 처리했습니다')
      } catch (error: any) {
        if (error.statusCode) {
          return ApiResponse.error(error.message, error.statusCode)
        }
        return ApiResponse.serverError('알림 처리 중 오류가 발생했습니다')
      }
    })
  })
}
