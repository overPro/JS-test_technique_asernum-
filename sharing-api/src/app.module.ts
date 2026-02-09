import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SharesModule } from './shares/shares.module';
import { DatabaseModule } from './database/database.module';
import { ConfigurationService } from './config/configuration.service';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,HealthModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    DatabaseModule,
    AuthModule,
    SharesModule,
  ],
})
export class AppModule {}
