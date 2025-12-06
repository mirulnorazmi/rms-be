import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Properties } from '../../properties/models/properties.model';

@Entity()
export class Units {
  @PrimaryGeneratedColumn()
  unit_id: number;

  @Column()
  property_id: number;

  @ManyToOne(() => Properties, { eager: true })
  @JoinColumn({ name: 'property_id', referencedColumnName: 'property_id' })
  property: Properties;

  @Column({ length: 50 })
  unit_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthly_rent: number;

  @Column({ length: 50 })
  status: string;

  @Column({ length: 500, nullable: true })
  main_image_path: string;
}

