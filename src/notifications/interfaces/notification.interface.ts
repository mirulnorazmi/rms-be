import { NotificationType } from '../enums/notification-type.enum';

export interface INotification {
  readonly notification_id: number;
  readonly user_id: number;
  readonly message: string;
  readonly notification_type: NotificationType;
  readonly is_read: boolean;
  readonly created_at: Date;
}

