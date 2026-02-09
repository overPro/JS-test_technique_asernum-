import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { DocumentRepository } from './repositories/document.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [DocumentRepository],
  exports: [TypeOrmModule, DocumentRepository],
})
export class DatabaseModule {}
