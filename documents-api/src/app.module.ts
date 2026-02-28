import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { FoldersModule } from './folders/folders.module';
import { UploadsModule } from './uploads/uploads.module';
import { DatabaseModule } from './database/database.module';
import { ConfigurationModule } from './config/configuration.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigurationModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, HealthModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: true,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          db: configService.get<number>('REDIS_DB', 0),
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
        },
      }),
    }),

    CqrsModule,
    DatabaseModule,
    AuthModule,
    DocumentsModule,
    FoldersModule,
    UploadsModule,
  ],
})
export class AppModule {}
