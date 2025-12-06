import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from './models/notifications.model';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { provideNotificationsRepository } from './repositories/notifications.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications])],
  controllers: [NotificationsController],
  providers: [NotificationsService, ...provideNotificationsRepository()],
  exports: [NotificationsService],
})
export class NotificationsModule {}

