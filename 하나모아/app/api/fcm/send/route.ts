import { NextRequest, NextResponse } from 'next/server'
import { sendPushNotification, sendPushNotificationToMultiple } from '../../../../lib/fcm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userIds, title, body: messageBody, data } = body

    if (!userIds || !title || !messageBody) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      }, { status: 400 })
    }

    let result
    if (Array.isArray(userIds)) {
      result = await sendPushNotificationToMultiple(userIds, title, messageBody, data)
    } else {
      result = await sendPushNotification(userIds, title, messageBody, data)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '푸시 알림이 전송되었습니다.',
        data: result.response
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '푸시 알림 전송에 실패했습니다.'
    }, { status: 500 })
  }
}
