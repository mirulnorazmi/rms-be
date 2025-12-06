import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Units } from '../../units/models/units.model';
import { Users } from '../../users/models/users.model';
import { IssueStatus } from '../enums/issue-status.enum';
import { IssuePriority } from '../enums/issue-priority.enum';

@Entity()
export class MaintenanceIssues {
  @PrimaryGeneratedColumn()
  issue_id: number;

  @Column()
  unit_id: number;

  @ManyToOne(() => Units, { eager: true })
  @JoinColumn({ name: 'unit_id', referencedColumnName: 'unit_id' })
  unit?: Units;

  @Column()
  reported_by_id: number;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'reported_by_id', referencedColumnName: 'user_id' })
  reported_by: Users;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.NEW,
  })
  status: IssueStatus;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 1000 })
  description: string;

  @Column({
    type: 'enum',
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  priority: IssuePriority;

  @CreateDateColumn()
  reported_date: Date;

  @Column({ type: 'date', nullable: true })
  completion_date: Date;

  @Column({ length: 500, nullable: true })
  image_path: string;

  @Column({ length: 100, nullable: true })
  category: string;
}

