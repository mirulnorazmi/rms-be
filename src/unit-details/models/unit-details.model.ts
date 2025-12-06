import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Units } from '../../units/models/units.model';

@Entity()
export class UnitDetails {
  @PrimaryGeneratedColumn()
  unit_detail_id: number;

  @Column()
  unit_id: number;

  @ManyToOne(() => Units, { eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Units;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 100 })
  size: string;

  @Column({ length: 50 })
  monthly_rent: string;

  @Column({ length: 50 })
  deposit: string;

  @Column({ length: 500 })
  facilities: string;
}

