import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('documents')
@Index(['user_id', 'deleted_at'])
@Index(['status'])
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ type: 'varchar', length: 255 })
  original_filename!: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;

  @Column({ type: 'bigint' })
  size_bytes!: number;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  folder_id!: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column({ type: 'varchar', length: 500 })
  file_path!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  file_hash!: string;

  @Column({ type: 'integer', nullable: true })
  image_width!: number;

  @Column({ type: 'integer', nullable: true })
  image_height!: number;

  @Column({ type: 'integer', nullable: true })
  pdf_pages!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
