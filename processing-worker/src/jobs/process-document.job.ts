import { Injectable, Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DocumentProcessor } from '../processors/document.processor';

@Processor('documents')
@Injectable()
export class ProcessDocumentProcessor extends WorkerHost {
  private readonly logger = new Logger('ProcessDocumentProcessor');

  constructor(private documentProcessor: DocumentProcessor) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { documentId, filePath, mimeType } = job.data;

    this.logger.log(`Job started: ${job.id} for document ${documentId}`);

    try {
      await this.documentProcessor.processDocument(
        documentId,
        filePath,
        mimeType,
      );

      this.logger.log(`Job completed: ${job.id}`);

      return {
        success: true,
        documentId,
        message: 'Document processed successfully',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Job failed: ${job.id} - ${msg}`);

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} has been completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} has failed: ${err.message} (attempt ${job.attemptsMade}/${job.opts.attempts})`,
    );
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.error(`Worker error: ${err.message}`);
  }
}
