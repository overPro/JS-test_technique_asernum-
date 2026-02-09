import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum ShareMode {
  READONLY = 'readonly',
  READWRITE = 'readwrite',
}

@Entity('shares')
@Index(['token'])
@Index(['document_id'])
@Index(['owner_user_id'])
@Index(['expires_at'])
export class ShareEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  token!: string;

  @Column({ type: 'uuid' })
  document_id!: string;

  @Column({ type: 'uuid' })
  owner_user_id!: string;

  @Column({
    type: 'enum',
    enum: ShareMode,
    default: ShareMode.READONLY,
  })
  mode!: ShareMode;

  @Column({ type: 'timestamp with time zone' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @DeleteDateColumn()
  revoked_at!: Date;
}
