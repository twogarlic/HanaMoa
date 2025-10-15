import admin from './firebase'
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  try {
    // 사용자의 FCM 토큰 조회
    const fcmToken = await prisma.fCMToken.findUnique({
      where: { userId }
    })

    if (!fcmToken) {
      return { success: false, error: 'FCM 토큰을 찾을 수 없습니다.' }
    }

    // 푸시 알림 전송
    const message = {
      token: fcmToken.token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
    }

    const response = await admin.messaging().send(message)
    
    return { success: true, response }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function sendPushNotificationToMultiple(
  userIds: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  try {
    // 여러 사용자의 FCM 토큰 조회
    const fcmTokens = await prisma.fCMToken.findMany({
      where: { userId: { in: userIds } }
    })

    if (fcmTokens.length === 0) {
      return { success: false, error: 'FCM 토큰을 찾을 수 없습니다.' }
    }

    // 멀티캐스트 메시지 생성
    const message = {
      tokens: fcmTokens.map((token: any) => token.token),
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
    }

    const response = await admin.messaging().sendMulticast(message)
    
    return { success: true, response }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
