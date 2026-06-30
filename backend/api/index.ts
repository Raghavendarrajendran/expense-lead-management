import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import express from 'express';

const server = express();
let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));
    
    // Enable CORS for frontend deployment
    nestApp.enableCors({
      origin: true,
      credentials: true,
    });
    
    nestApp.setGlobalPrefix('api');
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    nestApp.useGlobalInterceptors(new TransformInterceptor());
    nestApp.useGlobalFilters(new HttpExceptionFilter());
    
    await nestApp.init();
  }
  return server;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};
