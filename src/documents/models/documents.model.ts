import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Contracts } from '../../contracts/models/contracts.model';
import { Users } from '../../users/models/users.model';
import { DocType } from '../enums/doc-type.enum';

@Entity()
export class Documents {
  @PrimaryGeneratedColumn()
  doc_id: number;

  @Column()
  contract_id: number;

  @ManyToOne(() => Contracts, { eager: true })
  @JoinColumn({ name: 'contract_id', referencedColumnName: 'contract_id' })
  contract: Contracts;

  @Column()
  uploaded_by_id: number;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'uploaded_by_id', referencedColumnName: 'user_id' })
  uploaded_by: Users;

  @Column({
    type: 'enum',
    enum: DocType,
  })
  doc_type: DocType;

  @Column({ length: 255 })
  file_name: string;

  @Column({ length: 500 })
  file_path: string;

  @CreateDateColumn()
  uploaded_at: Date;
}

