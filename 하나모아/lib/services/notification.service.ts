import { notificationRepository } from '@/lib/repositories/notification.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'

export class NotificationService {
  async getNotifications(userId: string) {
    return await notificationRepository.findByUserId(userId)
  }

  async markAsRead(notificationId: string, userId: string) {
    const notifications = await notificationRepository.findByUserId(userId)
    const notification = notifications.find(n => n.id === notificationId)

    if (!notification) {
      throw new NotFoundError('알림을 찾을 수 없습니다')
    }

    return await notificationRepository.markAsRead(notificationId)
  }

  async markAllAsRead(userId: string) {
    return await notificationRepository.markAllAsRead(userId)
  }
}

export const notificationService = new NotificationService()

