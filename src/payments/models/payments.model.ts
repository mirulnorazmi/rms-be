import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contracts } from '../../contracts/models/contracts.model';
import { Users } from '../../users/models/users.model';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity()
export class Payments {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column()
  contract_id: number;

  @ManyToOne(() => Contracts, { eager: true })
  @JoinColumn({ name: 'contract_id', referencedColumnName: 'contract_id' })
  contract: Contracts;

  @Column()
  payer_id: number;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'payer_id', referencedColumnName: 'user_id' })
  payer: Users;

  @Column({ type: 'date', nullable: true })
  payment_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ length: 100, nullable: true })
  payment_method: string;
}

