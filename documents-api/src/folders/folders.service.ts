import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { FolderRepository } from '@database/repositories/folder.repository';
import { DocumentRepository } from '@database/repositories/document.repository';
import { CreateFolderDto, UpdateFolderDto } from './dto/folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    private folderRepository: FolderRepository,
    private documentRepository: DocumentRepository,
  ) {}

  async createFolder(userId: string, createFolderDto: CreateFolderDto) {
    const { name, parent_id } = createFolderDto;

    
    const existing = await this.folderRepository.findByName(name, userId, parent_id);
    if (existing) {
      throw new ConflictException('Folder with this name already exists');
    }

    
    if (parent_id) {
      const parent = await this.folderRepository.findById(parent_id, userId);
      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    const folder = await this.folderRepository.create({
      name,
      user_id: userId,
      parent_id: parent_id || (null as any),
    });

    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      createdAt: folder.created_at,
    };
  }

  async listFolders(userId: string, parentId?: string) {
    let folders;
    if (parentId) {
      folders = await this.folderRepository.findByParent(parentId, userId);
    } else {
      folders = await this.folderRepository.findRootFolders(userId);
    }

    return {
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        createdAt: f.created_at,
      })),
    };
  }

  async getFolder(folderId: string, userId: string) {
    const folder = await this.folderRepository.findById(folderId, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const documents = await this.documentRepository.findByFolder(folderId, userId);

    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      documents: documents.map((d) => ({
        id: d.id,
        filename: d.original_filename,
        status: d.status,
        size: d.size_bytes,
      })),
      createdAt: folder.created_at,
    };
  }

  async updateFolder(
    folderId: string,
    userId: string,
    updateFolderDto: UpdateFolderDto,
  ) {
    const folder = await this.folderRepository.findById(folderId, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const { name, parent_id } = updateFolderDto;

    if (name && name !== folder.name) {
      const existing = await this.folderRepository.findByName(name, userId, folder.parent_id || undefined);
      if (existing) {
        throw new ConflictException('Folder with this name already exists');
      }
    }

    const updated = await this.folderRepository.update(folderId, userId, {
      name: name || folder.name,
      parent_id: parent_id !== undefined ? parent_id : folder.parent_id,
    } as any);

    if (!updated) {
      throw new NotFoundException('Folder not found');
    }

    return {
      id: updated.id,
      name: updated.name,
      parentId: updated.parent_id,
      updatedAt: updated.updated_at,
    };
  }

  async deleteFolder(folderId: string, userId: string) {
    const folder = await this.folderRepository.findById(folderId, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    
    const documents = await this.documentRepository.findByFolder(folderId, userId);
    if (documents.length > 0) {
      throw new ConflictException('Folder is not empty');
    }

    await this.folderRepository.delete(folderId, userId);

    return {
      message: 'Folder deleted successfully',
    };
  }

  async deleteFolderRecursive(folderId: string, userId: string) {
    const folder = await this.folderRepository.findById(folderId, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.folderRepository.deleteRecursive(folderId, userId);

    return {
      message: 'Folder and its contents deleted successfully',
    };
  }

  async moveFolder(folderId: string, userId: string, newParentId?: string) {
    const folder = await this.folderRepository.findById(folderId, userId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (newParentId) {
      const newParent = await this.folderRepository.findById(newParentId, userId);
      if (!newParent) {
        throw new NotFoundException('New parent folder not found');
      }
    }

    const updated = await this.folderRepository.update(folderId, userId, {
      parent_id: newParentId || (null as any),
    });

    if (!updated) {
      throw new NotFoundException('Folder not found');
    }

    return {
      id: updated.id,
      parentId: updated.parent_id,
      updatedAt: updated.updated_at,
    };
  }
}
