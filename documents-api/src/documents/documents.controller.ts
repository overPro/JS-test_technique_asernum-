import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
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
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  async uploadDocument(
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('No file provided');
    }

    const fileBuffer = await data.toBuffer();
    const mimetype = data.mimetype || 'application/octet-stream';
    const filename = data.filename || 'unknown';

    if (fileBuffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    const maxFileSize = this.configService.uploadMaxSizeMb * 1024 * 1024;
    if (fileBuffer.length > maxFileSize) {
      throw new BadRequestException('File size exceeds maximum allowed');
    }

    if (!this.configService.uploadAllowedTypes.includes(mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    return this.documentsService.uploadDocument(
      user.id,
      filename.replace(/\s+/g, '_'),
      filename,
      mimetype,
      fileBuffer.length,
      fileBuffer,
      undefined,
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
