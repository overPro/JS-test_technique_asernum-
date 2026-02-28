import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareEntity } from './entities/share.entity';
import { ShareAccessEntity } from './entities/share-access.entity';
import { DocumentEntity } from './entities/document.entity';
import { ShareRepository } from './repositories/share.repository';
import { DocumentRepository } from './repositories/document.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShareEntity, ShareAccessEntity, DocumentEntity]),
  ],
  providers: [ShareRepository, DocumentRepository],
  exports: [TypeOrmModule, ShareRepository, DocumentRepository],
})
export class DatabaseModule {}
