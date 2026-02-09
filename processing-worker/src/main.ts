import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  await app.init();

  if (nodeEnv === 'development') {
    console.log('Initilisation du worker');
    console.log('Surveillance de la queue BullMQ : documents');
  }

  
  await new Promise(() => {});
}

bootstrap();
