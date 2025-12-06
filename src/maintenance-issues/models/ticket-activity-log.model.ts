import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MaintenanceIssues } from './maintenance-issues.model';
import { Users } from '../../users/models/users.model';

@Entity()
export class TicketActivityLog {
  @PrimaryGeneratedColumn()
  activity_id: number;

  @Column()
  issue_id: number;

  @ManyToOne(() => MaintenanceIssues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue: MaintenanceIssues;

  @Column({ length: 100 })
  activity_type: string; // e.g., 'submitted', 'assigned', 'in_progress', 'resolved', 'comment'

  @Column({ length: 500 })
  description: string;

  @Column({ nullable: true })
  performed_by_id: number;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'performed_by_id' })
  performed_by: Users;

  @CreateDateColumn()
  created_at: Date;
}

