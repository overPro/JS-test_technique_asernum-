import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DocumentEntity, DocumentStatus } from '../entities/document.entity';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private repository: Repository<DocumentEntity>,
  ) {}

  async findById(id: string, userId: string): Promise<DocumentEntity | null> {
    return this.repository.findOne({
      where: {
        id,
        user_id: userId,
        deleted_at: IsNull(),
      },
    });
  }

  async findByUser(userId: string, skip = 0, take = 10) {
    const [documents, total] = await this.repository.findAndCount({
      where: { user_id: userId, deleted_at: IsNull() },
      skip,
      take,
      order: { created_at: 'DESC' },
    });
    return { documents, total };
  }

  async findByFolder(folderId: string, userId: string) {
    return this.repository.find({
      where: {
        folder_id: folderId,
        user_id: userId,
        deleted_at: IsNull(),
      },
    });
  }

  async create(data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const doc = this.repository.create(data);
    return this.repository.save(doc);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<DocumentEntity>,
  ): Promise<DocumentEntity | null> {
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

  async findByStatus(status: DocumentStatus) {
    return this.repository.find({
      where: { status, deleted_at: IsNull() },
    });
  }

  async search(userId: string, query: string) {
    return this.repository
      .createQueryBuilder('doc')
      .where('doc.user_id = :userId', { userId })
      .andWhere('doc.deleted_at IS NULL')
      .andWhere(
        '(doc.filename ILIKE :query OR doc.original_filename ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('doc.created_at', 'DESC')
      .getMany();
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('doc')
      .select('SUM(doc.size_bytes)', 'total')
      .where('doc.user_id = :userId', { userId })
      .andWhere('doc.deleted_at IS NULL')
      .getRawOne();

    return parseInt(result?.total || 0);
  }
}
