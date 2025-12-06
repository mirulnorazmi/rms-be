import { NotificationDto } from '../dto/notification.dto';
import { NotificationUpdateDto } from '../dto/notification-update.dto';

export interface NotificationsRepository {
  findAll(): void;
  findById(notificationId: number): void;
  findByUserId(userId: number): void;
  findUnreadByUserId(userId: number): void;
  create(notificationDto: NotificationDto): void;
  update(notificationId: number, notificationUpdateDto: NotificationUpdateDto): void;
  markAsRead(notificationId: number): void;
  markAllAsReadByUserId(userId: number): void;
  delete(notificationId: number): void;
}

export const NOTIFICATIONS_REPOSITORY_TOKEN = 'notifications-repository-token';

