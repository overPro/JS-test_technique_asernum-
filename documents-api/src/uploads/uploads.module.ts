import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ConfigurationService } from '@config/configuration.service';

@Module({
  providers: [UploadsService, ConfigurationService],
  exports: [UploadsService],
})
export class UploadsModule {}
