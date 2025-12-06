import { IsNotEmpty, IsString, IsInt, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class NotificationDto {
  @IsInt()
  @IsNotEmpty()
  readonly user_id: number;

  @IsString()
  @IsNotEmpty()
  readonly message: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  readonly notification_type: NotificationType;

  @IsBoolean()
  @IsOptional()
  readonly is_read?: boolean;
}

