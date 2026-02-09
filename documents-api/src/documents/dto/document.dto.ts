import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ example: 'document.pdf', description: 'The name of the file to be uploaded' })
  @IsString()
  filename!: string;

  @ApiProperty({ example: 'document_original.pdf', description: 'Original file name' })
  @IsString()
  originalFilename!: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type of the file' })
  @IsString()
  mimeType!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Optional folder ID where the file will be stored' })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'new_name.pdf', description: 'New name of the document' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'New folder ID' })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class SearchDocumentsDto {
  @ApiProperty({ example: 'report', description: 'Search query string' })
  @IsString()
  query!: string;
}
