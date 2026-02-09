import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SharesModule } from '../shares/shares.module';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [DatabaseModule, SharesModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
