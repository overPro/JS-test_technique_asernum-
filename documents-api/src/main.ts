import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Register Fastify multipart plugin
  await app.register(require('@fastify/multipart') as any, {
    limits: {
      fileSize: 52428800, // 50 MB
    },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';


  app.useGlobalFilters(new AllExceptionsFilter());

  // activation CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Documents API')
    .setDescription('API gestion des fichiers et métadonnées')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer(`http://localhost:${port}`, 'Local')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);


  await app.listen(port, '0.0.0.0');

  if (nodeEnv === 'development') {
    console.log(`La documentation de l'API est disponible sur http://localhost:${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
