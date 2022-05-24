import { ShutdownSignal, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { EmistriLogger } from './modules/commons/logger/logger.service';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cors, helmet and logger
  app.enableCors();
  app.use(helmet());
  app.useLogger(app.get(EmistriLogger));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Enable shutdown hooks
  app.enableShutdownHooks(['SIGINT', 'SIGBREAK', 'SIGTERM']);

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Emistri API')
    .setDescription('Emistri API')
    .setVersion('1.0')
    .addTag('emistri')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
