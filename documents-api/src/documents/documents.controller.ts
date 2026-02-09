import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { UploadDocumentDto } from './dto/document.dto';
import { SearchDocumentsDto } from './dto/document.dto';
import { ConfigurationService } from '@config/configuration.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private configService: ConfigurationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Query() query: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxFileSize = this.configService.uploadMaxSizeMb * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds maximum allowed');
    }

    if (!this.configService.uploadAllowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    return this.documentsService.uploadDocument(
      user.id,
      file.filename,
      query.originalFilename,
      file.mimetype,
      file.size,
      query.folderId,
      `/uploads/${user.id}/${file.filename}`,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List user documents' })
  async listDocuments(
    @CurrentUser() user: any,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.documentsService.listDocuments(user.id, skip, take);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents by name' })
  async searchDocuments(
    @CurrentUser() user: any,
    @Query() query: SearchDocumentsDto,
  ) {
    return this.documentsService.searchDocuments(user.id, query.query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document details' })
  async getDocument(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.getDocument(documentId, user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get document download URL' })
  async getDownloadUrl(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
  ) {
    const url = await this.documentsService.getDownloadUrl(documentId, user.id);
    return { url };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.deleteDocument(documentId, user.id);
  }
}
