import prisma from '@/lib/database'

export class NotificationRepository {
  async findByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
  }
}

export const notificationRepository = new NotificationRepository()

