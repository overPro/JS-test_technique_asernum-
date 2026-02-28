import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UploadDocumentCommand } from '../../commands/upload-document.command';
import { DocumentUploadedEvent } from '../../events/document.events';
import { DocumentRepository } from '@database/repositories/document.repository';
import { UserRepository } from '@database/repositories/user.repository';
import { DocumentEntity } from '@database/entities/document.entity';
import { ConfigurationService } from '@config/configuration.service';
import { UploadsService } from '@uploads/uploads.service';

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand> {
  constructor(
    private documentRepository: DocumentRepository,
    private userRepository: UserRepository,
    private configService: ConfigurationService,
    private uploadsService: UploadsService,
    private eventBus: EventBus,
    @InjectQueue('documents') private documentsQueue: Queue,
  ) {}

  async execute(command: UploadDocumentCommand) {
    const {
      userId,
      filename,
      originalFilename,
      mimeType,
      sizeBytes,
      fileBuffer,
      folderId,
    } = command;

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check quota
    const maxQuota = this.configService.userQuotaMb * 1024 * 1024;
    const availableSpace = maxQuota - user.used_bytes;
    if (sizeBytes > availableSpace) {
      throw new ConflictException('Storage quota exceeded');
    }

    // Check file size
    const maxFileSize = this.configService.uploadMaxSizeMb * 1024 * 1024;
    if (sizeBytes > maxFileSize) {
      throw new BadRequestException('File size exceeds maximum allowed');
    }

    // Check MIME type
    if (!this.configService.uploadAllowedTypes.includes(mimeType)) {
      throw new BadRequestException('File type not allowed');
    }

    // Save file to disk
    const filePath = await this.uploadsService.saveUploadedFile(userId, {
      originalname: originalFilename,
      buffer: fileBuffer,
      size: sizeBytes,
      mimetype: mimeType,
    });

    // Create document
    const document = await this.documentRepository.create({
      filename,
      original_filename: originalFilename,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      user_id: userId,
      folder_id: folderId,
      file_path: filePath,
      status: 'pending' as any,
    });

    // Update user quota
    await this.userRepository.update(userId, {
      used_bytes: user.used_bytes + sizeBytes,
    } as any);

    // Publish event
    this.eventBus.publish(
      new DocumentUploadedEvent(
        document.id,
        userId,
        filename,
        mimeType,
        document.file_path,
      ),
    );

    // Create BullMQ job
    await this.documentsQueue.add('process-document', {
      documentId: document.id,
      filePath: document.file_path,
      mimeType: document.mime_type,
    });

    return {
      id: document.id,
      filename: document.filename,
      status: document.status,
      sizeBytes: document.size_bytes,
      createdAt: document.created_at,
    };
  }
}
