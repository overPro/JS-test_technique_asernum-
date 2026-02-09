import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ShareEntity } from './share.entity';

@Entity('share_accesses')
@Index(['share_id'])
@Index(['accessed_at'])
export class ShareAccessEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  share_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accessed_by_email!: string;

  @CreateDateColumn()
  accessed_at!: Date;

  @Column({ type: 'inet', nullable: true })
  ip_address!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent!: string;

  @ManyToOne(() => ShareEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'share_id' })
  share!: ShareEntity;
}
