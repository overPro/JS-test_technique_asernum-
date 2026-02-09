import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DocumentEntity } from './entities/document.entity';
import { FolderEntity } from './entities/folder.entity';
import { UserRepository } from './repositories/user.repository';
import { DocumentRepository } from './repositories/document.repository';
import { FolderRepository } from './repositories/folder.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DocumentEntity, FolderEntity]),
  ],
  providers: [UserRepository, DocumentRepository, FolderRepository],
  exports: [TypeOrmModule, UserRepository, DocumentRepository, FolderRepository],
})
export class DatabaseModule {}
