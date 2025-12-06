import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Users } from '../../users/models/users.model';
import { NotificationType } from '../enums/notification-type.enum';

@Entity()
export class Notifications {
  @PrimaryGeneratedColumn()
  notification_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notification_type: NotificationType;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}

