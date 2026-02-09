import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';
import * as fs from 'fs';
import { ImageProcessor } from './image.processor';
import { PdfProcessor } from './pdf.processor';
import { DocumentRepository } from '../database/repositories/document.repository';
import { DocumentStatus } from '../database/entities/document.entity';

@Injectable()
export class DocumentProcessor {
  private readonly logger = new Logger('DocumentProcessor');

  constructor(
    private imageProcessor: ImageProcessor,
    private pdfProcessor: PdfProcessor,
    private documentRepository: DocumentRepository,
  ) {}

  async processDocument(
    documentId: string,
    filePath: string,
    mimeType: string,
  ): Promise<void> {
    try {
      this.logger.log(`Processing document: ${documentId}`);

      await this.documentRepository.updateStatus(
        documentId,
        DocumentStatus.PROCESSING,
      );

      const fileHash = this.generateSHA256(filePath);
      this.logger.log(`Hash generated: ${fileHash}`);

      const metadata: any = { file_hash: fileHash };

      if (mimeType.startsWith('image/')) {
        const imgMeta = await this.imageProcessor.extractMetadata(filePath);
        metadata.image_width = imgMeta.width;
        metadata.image_height = imgMeta.height;
      } else if (mimeType === 'application/pdf') {
        const pdfMeta = await this.pdfProcessor.extractMetadata(filePath);
        metadata.pdf_pages = pdfMeta.pages;
      }

      await this.documentRepository.updateMetadata(documentId, metadata);

      await this.documentRepository.updateStatus(
        documentId,
        DocumentStatus.COMPLETED,
      );

      this.logger.log(`Document processed successfully: ${documentId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process document: ${msg}`);

      await this.documentRepository.updateStatus(
        documentId,
        DocumentStatus.FAILED,
      );

      throw error;
    }
  }

  private generateSHA256(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
}
