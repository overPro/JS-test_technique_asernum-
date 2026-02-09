import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { DocumentEntity } from './document.entity';
import { FolderEntity } from './folder.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstname!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastname!: string;

  @Column({ type: 'bigint', default: 104857600 })
  quota_bytes!: number;

  @Column({ type: 'bigint', default: 0 })
  used_bytes!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @OneToMany(() => DocumentEntity, (doc) => doc.user)
  documents!: DocumentEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.user)
  folders!: FolderEntity[];
}
