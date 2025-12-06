import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Units } from '../../units/models/units.model';
import { Users } from '../../users/models/users.model';
import { ContractStatus } from '../enums/contract-status.enum';

@Entity()
export class Contracts {
  @PrimaryGeneratedColumn()
  contract_id: number;

  @Column()
  unit_id: number;

  @ManyToOne(() => Units, { eager: true })
  @JoinColumn({ name: 'unit_id', referencedColumnName: 'unit_id' })
  unit: Units;

  @Column()
  tenant_id: number;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'user_id' })
  tenant: Users;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  security_deposit: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.ACTIVE,
  })
  status: ContractStatus;
}

