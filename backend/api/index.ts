import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';

let cachedServer: Express;

async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const server = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn', 'log'] },
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
  cachedServer = server;
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  try {
    const server = await bootstrapServer();
    server(req, res);
  } catch (error: any) {
    console.error('NestJS Serverless Cold-Start Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Serverless initialization failed',
      error: error?.message || String(error),
      details: 'Check Vercel environment variables (DATABASE_URL, JWT_USER_SECRET, JWT_ADMIN_SECRET)',
    });
  }
}

