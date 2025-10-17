import { NextRequest } from 'next/server'
import { sendPushNotification, sendPushNotificationToMultiple } from '@/lib/fcm'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userIds, title, body: messageBody, data } = body

    if (!userIds || !title || !messageBody) {
      return ApiResponse.badRequest('필수 필드가 누락되었습니다')
    }

    let result
    if (Array.isArray(userIds)) {
      result = await sendPushNotificationToMultiple(userIds, title, messageBody, data)
    } else {
      result = await sendPushNotification(userIds, title, messageBody, data)
    }

    if (result.success) {
      return ApiResponse.success(
        { response: result.response },
        '푸시 알림이 전송되었습니다'
      )
    } else {
      return ApiResponse.serverError(result.error || '푸시 알림 전송에 실패했습니다')
    }
  } catch (error) {
    return ApiResponse.serverError('푸시 알림 전송에 실패했습니다')
  }
}
