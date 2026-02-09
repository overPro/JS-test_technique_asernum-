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

  get databaseUrl(): string {
    return this.configService.get<string>(
      'DATABASE_URL',
      'postgresql://postgres:postgres@localhost:5432/documents_db',
    );
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

  get workerConcurrency(): number {
    return this.configService.get<number>('WORKER_CONCURRENCY', 5);
  }

  get workerTimeoutMs(): number {
    return this.configService.get<number>('WORKER_TIMEOUT_MS', 30000);
  }

  get workerRetryAttempts(): number {
    return this.configService.get<number>('WORKER_RETRY_ATTEMPTS', 3);
  }

  get workerRetryDelayMs(): number {
    return this.configService.get<number>('WORKER_RETRY_DELAY_MS', 5000);
  }

  get uploadBaseDir(): string {
    return this.configService.get<string>('UPLOAD_BASE_DIR', './uploads');
  }
}
