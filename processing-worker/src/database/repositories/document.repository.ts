import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity, DocumentStatus } from '../entities/document.entity';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private repository: Repository<DocumentEntity>,
  ) {}

  async findById(id: string): Promise<DocumentEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<DocumentEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async updateMetadata(
    id: string,
    metadata: {
      image_width?: number;
      image_height?: number;
      pdf_pages?: number;
      file_hash?: string;
    },
  ): Promise<void> {
    await this.repository.update(id, metadata);
  }
}
