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
    return this.configService.get<number>('PORT', 3002);
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

  get shareLinkExpiryHours(): number {
    return parseInt(this.configService.get<string>('SHARE_LINK_EXPIRY_HOURS', '24'), 10);
  }

  get shareLinkMaxDownDays(): number {
    return parseInt(this.configService.get<string>('SHARE_LINK_MAX_DOWN_DAYS', '30'), 10);
  }

  get shareLinkTokenLength(): number {
    return parseInt(this.configService.get<string>('SHARE_LINK_TOKEN_LENGTH', '32'), 10);
  }

  get documentsApiUrl(): string {
    return this.configService.get<string>(
      'DOCUMENTS_API_URL',
      'http://localhost:3001',
    );
  }

  get redisUrl(): string {
    return this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
  }
}
