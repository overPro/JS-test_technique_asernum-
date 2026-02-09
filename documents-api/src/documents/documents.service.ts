import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UploadDocumentCommand } from './commands/upload-document.command';
import { GetDocumentQuery, ListDocumentsQuery, SearchDocumentsQuery } from './queries/document.query';
import { DocumentRepository } from '@database/repositories/document.repository';
import { ConfigurationService } from '@config/configuration.service';

@Injectable()
export class DocumentsService {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private documentRepository: DocumentRepository,
    private configService: ConfigurationService,
  ) {}

  async uploadDocument(
    userId: string,
    filename: string,
    originalFilename: string,
    mimeType: string,
    sizeBytes: number,
    folderId?: string,
    filePath?: string,
  ) {
    const command = new UploadDocumentCommand(
      userId,
      filename,
      originalFilename,
      mimeType,
      sizeBytes,
      folderId,
      filePath,
    );

    return this.commandBus.execute(command);
  }

  async getDocument(documentId: string, userId: string) {
    const query = new GetDocumentQuery(documentId, userId);
    return this.queryBus.execute(query);
  }

  async listDocuments(userId: string, skip = 0, take = 10) {
    const query = new ListDocumentsQuery(userId, skip, take);
    return this.queryBus.execute(query);
  }

  async searchDocuments(userId: string, searchQuery: string) {
    const query = new SearchDocumentsQuery(userId, searchQuery);
    return this.queryBus.execute(query);
  }

  async deleteDocument(documentId: string, userId: string) {
    const document = await this.documentRepository.findById(documentId, userId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.documentRepository.delete(documentId, userId);

    return {
      message: 'Document deleted successfully',
    };
  }

  async getDownloadUrl(documentId: string, userId: string): Promise<string> {
    const document = await this.documentRepository.findById(documentId, userId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

  
    return document.file_path;
  }
}
