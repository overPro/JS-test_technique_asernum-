import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'Invoices', description: 'Name of the folder' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Optional parent folder ID' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}

export class UpdateFolderDto {
  @ApiPropertyOptional({ example: 'New Folder Name', description: 'New name of the folder' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Optional new parent folder ID' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}

export class MoveFolderDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Target parent folder ID to move this folder into' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
