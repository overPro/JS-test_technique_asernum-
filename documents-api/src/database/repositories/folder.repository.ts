import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FolderEntity } from '../entities/folder.entity';

@Injectable()
export class FolderRepository {
  constructor(
    @InjectRepository(FolderEntity)
    private repository: Repository<FolderEntity>,
  ) {}

  async findById(id: string, userId: string): Promise<FolderEntity | null> {
    return this.repository.findOne({
      where: {
        id,
        user_id: userId,
        deleted_at: IsNull(),
      },
      relations: ['child_folders', 'documents'],
    });
  }

  async findByUser(userId: string) {
    return this.repository.find({
      where: {
        user_id: userId,
        deleted_at: IsNull(),
      },
      order: { created_at: 'DESC' },
    });
  }

  async findRootFolders(userId: string) {
    return this.repository.find({
      where: {
        user_id: userId,
        parent_id: IsNull(),
        deleted_at: IsNull(),
      },
    });
  }

  async findByParent(parentId: string, userId: string) {
    return this.repository.find({
      where: {
        parent_id: parentId,
        user_id: userId,
        deleted_at: IsNull(),
      },
    });
  }

  async findByName(name: string, userId: string, parentId?: string) {
    const query = this.repository.createQueryBuilder('folder');
    query.where('folder.user_id = :userId', { userId });
    query.andWhere('folder.name = :name', { name });
    query.andWhere('folder.deleted_at IS NULL');

    if (parentId) {
      query.andWhere('folder.parent_id = :parentId', { parentId });
    } else {
      query.andWhere('folder.parent_id IS NULL');
    }

    return query.getOne();
  }

  async create(data: Partial<FolderEntity>): Promise<FolderEntity> {
    const folder = this.repository.create(data);
    return this.repository.save(folder);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<FolderEntity>,
  ): Promise<FolderEntity | null> {
    await this.repository.update(
      { id, user_id: userId },
      data,
    );
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repository.softDelete({
      id,
      user_id: userId,
    });
  }

  async deleteRecursive(folderId: string, userId: string): Promise<void> {
    const folder = await this.repository.findOne({
      where: { id: folderId, user_id: userId },
      relations: ['child_folders'],
    });

    if (folder) {
      for (const child of folder.child_folders) {
        await this.deleteRecursive(child.id, userId);
      }
      await this.repository.softDelete(folderId);
    }
  }
}
