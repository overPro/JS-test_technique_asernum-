import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { CreateFolderDto, UpdateFolderDto, MoveFolderDto } from './dto/folder.dto';

@ApiTags('Folders')
@Controller('folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new folder' })
  async createFolder(
    @CurrentUser() user: any,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.foldersService.createFolder(user.id, createFolderDto);
  }

  @Get()
  @ApiOperation({ summary: 'List folders' })
  async listFolders(
    @CurrentUser() user: any,
    @Query('parent_id') parentId?: string,
  ) {
    return this.foldersService.listFolders(user.id, parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder details' })
  async getFolder(
    @CurrentUser() user: any,
    @Param('id') folderId: string,
  ) {
    return this.foldersService.getFolder(folderId, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update folder' })
  async updateFolder(
    @CurrentUser() user: any,
    @Param('id') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.updateFolder(folderId, user.id, updateFolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete empty folder' })
  async deleteFolder(
    @CurrentUser() user: any,
    @Param('id') folderId: string,
  ) {
    return this.foldersService.deleteFolder(folderId, user.id);
  }

  @Delete(':id/recursive')
  @ApiOperation({ summary: 'Delete folder and all contents' })
  async deleteFolderRecursive(
    @CurrentUser() user: any,
    @Param('id') folderId: string,
  ) {
    return this.foldersService.deleteFolderRecursive(folderId, user.id);
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move folder to new parent' })
  async moveFolder(
    @CurrentUser() user: any,
    @Param('id') folderId: string,
    @Body() moveFolderDto: MoveFolderDto,
  ) {
    return this.foldersService.moveFolder(folderId, user.id, moveFolderDto.parent_id);
  }
}
