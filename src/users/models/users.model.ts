import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Roles } from '../../roles/models/roles.model';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  role_id: number;

  @ManyToOne(() => Roles, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @Column({ unique: true })
  email: string;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ length: 20, nullable: true })
  phone_number: string;

  @Column({ length: 255 })
  password_hash: string;

  // password_clear is NOT stored in database - it's only used in DTOs for input
  // and gets hashed before saving to password_hash
}
