import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') 
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    await prisma.notification.deleteMany({
      where: {
        userId: userId,
        OR: [
          { isRead: true },
          { createdAt: { lt: threeDaysAgo } }
        ]
      }
    })

    const where: any = {
      userId: userId
    }

    if (type) {
      where.type = type
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: unreadCount,
      total: notifications.length
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '알림 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, userId } = body

    if (!notificationId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: '알림 ID와 사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId 
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '알림 읽음 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count}개의 알림을 읽음 처리했습니다.`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '알림 읽음 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}


