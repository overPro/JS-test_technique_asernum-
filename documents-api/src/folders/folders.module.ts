import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
