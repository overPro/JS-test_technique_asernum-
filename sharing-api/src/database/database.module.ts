import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareEntity } from './entities/share.entity';
import { ShareAccessEntity } from './entities/share-access.entity';
import { ShareRepository } from './repositories/share.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShareEntity, ShareAccessEntity]),
  ],
  providers: [ShareRepository],
  exports: [TypeOrmModule, ShareRepository],
})
export class DatabaseModule {}
