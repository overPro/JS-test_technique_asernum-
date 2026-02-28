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
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<DocumentEntity | null> {
    return this.repository.findOne({
      where: { id, user_id: userId },
    });
  }

  async isDocumentCompleted(documentId: string): Promise<boolean> {
    const document = await this.repository.findOne({
      where: { id: documentId, status: DocumentStatus.COMPLETED },
    });
    return !!document;
  }

  async getDocumentStatus(documentId: string): Promise<DocumentStatus | null> {
    const document = await this.repository.findOne({
      select: ['status'],
      where: { id: documentId },
    });
    return document?.status || null;
  }
}
