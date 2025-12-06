import { NotificationType } from '../enums/notification-type.enum';

export class Notification {
  constructor(
    public notification_id: number,
    public user_id: number,
    public message: string,
    public notification_type: NotificationType,
    public is_read: boolean,
    public created_at: Date,
  ) {}
}

