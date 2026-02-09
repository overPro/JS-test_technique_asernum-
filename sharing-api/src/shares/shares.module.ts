import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { ConfigurationService } from '../config/configuration.service';
import { ConfigurationModule } from '../config/configuration.module';

@Module({
  imports: [DatabaseModule, ConfigurationModule],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}
