import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { ProcessDocumentProcessor } from './process-document.job';
import { DocumentProcessor } from '../processors/document.processor';
import { ImageProcessor } from '../processors/image.processor';
import { PdfProcessor } from '../processors/pdf.processor';
import { ConfigurationService } from '../config/configuration.service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'documents',
    }),
  ],
  providers: [
    ProcessDocumentProcessor,
    DocumentProcessor,
    ImageProcessor,
    PdfProcessor,
    ConfigurationService,
  ],
})
export class ProcessingModule {}
