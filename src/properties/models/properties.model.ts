import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from '../../users/models/users.model';

@Entity()
export class Properties {
  @PrimaryGeneratedColumn()
  property_id: number;

  @Column()
  landlord_id: number;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'landlord_id', referencedColumnName: 'user_id' })
  landlord: Users;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 20 })
  zip_code: string;

  @Column({ length: 500, nullable: true })
  main_image_path: string;
}

