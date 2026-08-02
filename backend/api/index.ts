import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Request, Response } from 'express';

const server = express();

let isInitialized = false;

// Singleton promise — created once per cold start
const initPromise = (async () => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.init();
  isInitialized = true;
})();

// Vercel serverless handler — awaits initialization on cold start
export default async function handler(req: Request, res: Response) {
  if (!isInitialized) {
    await initPromise;
  }
  server(req, res);
}
