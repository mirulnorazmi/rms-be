import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ length: 50 })
  role_name: string;
}

