import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { DocumentEntity } from './document.entity';

@Entity('folders')
@Index(['user_id', 'deleted_at'])
@Index(['parent_id', 'deleted_at'])
export class FolderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.folders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => FolderEntity, (folder) => folder.child_folders, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: FolderEntity;

  @OneToMany(() => FolderEntity, (folder) => folder.parent)
  child_folders!: FolderEntity[];

  @OneToMany(() => DocumentEntity, (doc) => doc.folder)
  documents!: DocumentEntity[];
}
