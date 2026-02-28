import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('documents')
export class DocumentEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ type: 'varchar', length: 255 })
  original_filename!: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;

  @Column({ type: 'bigint' })
  size_bytes!: number;

  @Column('uuid')
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  folder_id?: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column({ type: 'varchar', length: 500 })
  file_path!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  file_hash?: string;

  @Column({ type: 'int', nullable: true })
  image_width?: number;

  @Column({ type: 'int', nullable: true })
  image_height?: number;

  @Column({ type: 'int', nullable: true })
  pdf_pages?: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date;
}
