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
    return parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);
  }

  get redisDb(): number {
    return parseInt(this.configService.get<string>('REDIS_DB', '0'), 10);
  }

  get workerConcurrency(): number {
    return parseInt(this.configService.get<string>('WORKER_CONCURRENCY', '5'), 10);
  }

  get workerTimeoutMs(): number {
    return parseInt(this.configService.get<string>('WORKER_TIMEOUT_MS', '30000'), 10);
  }

  get workerRetryAttempts(): number {
    return parseInt(this.configService.get<string>('WORKER_RETRY_ATTEMPTS', '3'), 10);
  }

  get workerRetryDelayMs(): number {
    return parseInt(this.configService.get<string>('WORKER_RETRY_DELAY_MS', '5000'), 10);
  }

  get uploadBaseDir(): string {
    return this.configService.get<string>('UPLOAD_BASE_DIR', './uploads');
  }
}
