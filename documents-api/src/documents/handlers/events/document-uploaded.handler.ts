import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DocumentUploadedEvent } from '../../events/document.events';

@EventsHandler(DocumentUploadedEvent)
export class DocumentUploadedHandler
  implements IEventHandler<DocumentUploadedEvent>
{
  private readonly logger = new Logger('DocumentUploadedHandler');

  handle(event: DocumentUploadedEvent) {
    this.logger.log(
      `Document uploaded: ${event.documentId} by user ${event.userId}`,
    );
    
  }
}
