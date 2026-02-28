import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('ProcessingWorker');
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  await app.init();

  logger.log('Processing Worker initialized');
  logger.log('Listening to BullMQ queue: documents');
  logger.log(`Environment: ${nodeEnv}`);

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, gracefulShutdown');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, gracefulShutdown');
    await app.close();
    process.exit(0);
  });

  // Keep process alive indefinitely
  await new Promise(() => {
    // Process will never resolve, keeping worker alive
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error in worker startup:', err);
  process.exit(1);
});
