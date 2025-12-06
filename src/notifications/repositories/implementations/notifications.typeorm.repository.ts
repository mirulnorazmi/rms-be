import { Notifications } from '../../models/notifications.model';
import { NotificationsRepository } from '../notifications.repository.interface';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { NotificationDto } from '../../dto/notification.dto';
import { NotificationUpdateDto } from '../../dto/notification-update.dto';
import { INotification } from '../../interfaces/notification.interface';

export class NotificationsTypeOrmRepository implements NotificationsRepository {
  constructor(private readonly notificationsRepository: Repository<Notifications>) {}

  public async findAll(): Promise<Notifications[]> {
    return await this.notificationsRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  public async findById(notificationId: number): Promise<Notifications | null> {
    return await this.notificationsRepository.findOne({
      where: { notification_id: notificationId },
      relations: ['user'],
    });
  }

  public async findByUserId(userId: number): Promise<Notifications[]> {
    return await this.notificationsRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  public async findUnreadByUserId(userId: number): Promise<Notifications[]> {
    return await this.notificationsRepository.find({
      where: { user_id: userId, is_read: false },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  public async create(notificationDto: NotificationDto): Promise<INotification> {
    return await this.notificationsRepository.save(notificationDto);
  }

  public async update(
    notificationId: number,
    notificationUpdateDto: NotificationUpdateDto,
  ): Promise<UpdateResult> {
    return await this.notificationsRepository.update(
      { notification_id: notificationId },
      { ...notificationUpdateDto },
    );
  }

  public async markAsRead(notificationId: number): Promise<UpdateResult> {
    return await this.notificationsRepository.update(
      { notification_id: notificationId },
      { is_read: true },
    );
  }

  public async markAllAsReadByUserId(userId: number): Promise<UpdateResult> {
    return await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }

  public async delete(notificationId: number): Promise<DeleteResult> {
    return await this.notificationsRepository.delete({ notification_id: notificationId });
  }
}

