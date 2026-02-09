import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '@database/database.module';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { ConfigurationService } from '@config/configuration.service';
import { ConfigurationModule } from '@config/configuration.module';


// Commands
import { UploadDocumentHandler } from './handlers/commands/upload-document.handler';

// Queries
import { GetDocumentHandler } from './handlers/queries/get-document.handler';
import { SearchDocumentsHandler } from './handlers/queries/get-document.handler';

// Events
import { DocumentUploadedHandler } from './handlers/events/document-uploaded.handler';

const CommandHandlers = [UploadDocumentHandler];
const QueryHandlers = [GetDocumentHandler, SearchDocumentsHandler];
const EventHandlers = [DocumentUploadedHandler];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    ConfigurationModule,
    BullModule.registerQueue({
      name: 'documents',
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
