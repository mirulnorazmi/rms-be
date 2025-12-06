import { PartialType } from '@nestjs/swagger';
import { NotificationDto } from './notification.dto';

export class NotificationUpdateDto extends PartialType(NotificationDto) {}

