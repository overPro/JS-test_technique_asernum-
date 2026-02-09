import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetDocumentQuery, ListDocumentsQuery, SearchDocumentsQuery } from '../../queries/document.query';
import { DocumentRepository } from '@database/repositories/document.repository';

@QueryHandler(GetDocumentQuery)
export class GetDocumentHandler implements IQueryHandler<GetDocumentQuery> {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(query: GetDocumentQuery) {
    const document = await this.documentRepository.findById(
      query.documentId,
      query.userId,
    );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      id: document.id,
      filename: document.original_filename,
      mimeType: document.mime_type,
      sizeBytes: document.size_bytes,
      status: document.status,
      imageWidth: document.image_width,
      imageHeight: document.image_height,
      pdfPages: document.pdf_pages,
      fileHash: document.file_hash,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    };
  }
}

@QueryHandler(ListDocumentsQuery)
export class ListDocumentsHandler implements IQueryHandler<ListDocumentsQuery> {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(query: ListDocumentsQuery) {
    const { documents, total } = await this.documentRepository.findByUser(
      query.userId,
      query.skip,
      query.take,
    );

    return {
      documents: documents.map((doc) => ({
        id: doc.id,
        filename: doc.original_filename,
        mimeType: doc.mime_type,
        sizeBytes: doc.size_bytes,
        status: doc.status,
        createdAt: doc.created_at,
      })),
      total,
      skip: query.skip,
      take: query.take,
    };
  }
}

@QueryHandler(SearchDocumentsQuery)
export class SearchDocumentsHandler implements IQueryHandler<SearchDocumentsQuery> {
  constructor(private documentRepository: DocumentRepository) {}

  async execute(query: SearchDocumentsQuery) {
    const documents = await this.documentRepository.search(
      query.userId,
      query.query,
    );

    return {
      documents: documents.map((doc) => ({
        id: doc.id,
        filename: doc.original_filename,
        mimeType: doc.mime_type,
        sizeBytes: doc.size_bytes,
        status: doc.status,
        createdAt: doc.created_at,
      })),
      total: documents.length,
    };
  }
}
