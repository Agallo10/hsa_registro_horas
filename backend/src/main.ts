import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  const corsOrigins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (corsOrigins.length > 0) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // iisnode expone process.env.PORT como named pipe (ej. \\.\pipe\...);
  // por eso no se coerce a Number y se prefiere process.env.PORT.
  const port = process.env.PORT ?? config.get<string>('PORT') ?? '3000';
  await app.listen(port);
}
await bootstrap();
