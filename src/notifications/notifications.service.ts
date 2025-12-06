import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { INotification } from './interfaces/notification.interface';
import { Notifications } from './models/notifications.model';
import { NotificationDto } from './dto/notification.dto';
import { NotificationUpdateDto } from './dto/notification-update.dto';
import { NOTIFICATIONS_REPOSITORY_TOKEN } from './repositories/notifications.repository.interface';
import { NotificationsTypeOrmRepository } from './repositories/implementations/notifications.typeorm.repository';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY_TOKEN)
    private readonly notificationsRepository: NotificationsTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Notifications[]> {
    return await this.notificationsRepository.findAll();
  }

  public async findById(notificationId: number): Promise<Notifications> {
    const notification = await this.notificationsRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException(`Notification #${notificationId} not found`);
    }

    return notification;
  }

  public async findByUserId(userId: number): Promise<Notifications[]> {
    return await this.notificationsRepository.findByUserId(userId);
  }

  public async findUnreadByUserId(userId: number): Promise<Notifications[]> {
    return await this.notificationsRepository.findUnreadByUserId(userId);
  }

  public async create(notificationDto: NotificationDto): Promise<INotification> {
    try {
      return await this.notificationsRepository.create(notificationDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    notificationId: number,
    notificationUpdateDto: NotificationUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const notification = await this.findById(notificationId);
      if (!notification) {
        throw new NotFoundException(`Notification #${notificationId} not found`);
      }
      return await this.notificationsRepository.update(notificationId, notificationUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async markAsRead(notificationId: number): Promise<UpdateResult> {
    try {
      const notification = await this.findById(notificationId);
      if (!notification) {
        throw new NotFoundException(`Notification #${notificationId} not found`);
      }
      return await this.notificationsRepository.markAsRead(notificationId);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async markAllAsReadByUserId(userId: number): Promise<UpdateResult> {
    try {
      return await this.notificationsRepository.markAllAsReadByUserId(userId);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(notificationId: number): Promise<DeleteResult> {
    const notification = await this.findById(notificationId);
    if (!notification) {
      throw new NotFoundException(`Notification #${notificationId} not found`);
    }
    return await this.notificationsRepository.delete(notificationId);
  }
}

