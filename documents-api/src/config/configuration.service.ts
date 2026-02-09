import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'debug');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get databaseUrl(): string {
    return this.configService.get<string>(
      'DATABASE_URL',
      'postgresql://postgres:postgres@localhost:5432/documents_db',
    );
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'test-secret-key');
  }

  get jwtExpiry(): string {
    return this.configService.get<string>('JWT_EXPIRY', '7d');
  }

  get redisUrl(): string {
    return this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
  }

  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get redisDb(): number {
    return this.configService.get<number>('REDIS_DB', 0);
  }

  get uploadBaseDir(): string {
    return this.configService.get<string>('UPLOAD_BASE_DIR', './uploads');
  }

  get uploadMaxSizeMb(): number {
    return this.configService.get<number>('UPLOAD_MAX_SIZE_MB', 50);
  }

  get uploadAllowedTypes(): string[] {
    const types = this.configService.get<string>(
      'UPLOAD_ALLOWED_TYPES',
      'application/pdf,image/jpeg,image/png,text/plain',
    );
    return types.split(',').map((t) => t.trim());
  }

  get userQuotaMb(): number {
    return this.configService.get<number>('USER_QUOTA_MB', 100);
  }

  get sharingApiUrl(): string {
    return this.configService.get<string>(
      'SHARING_API_URL',
      'http://localhost:3002',
    );
  }
}
