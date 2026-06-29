import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RbacGuard } from './common/guards/rbac.guard';
import { InMemoryStore } from './store/in-memory.store';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — allow React dev server
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global response transform
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Aadhan Solar Backend running on http://localhost:${port}/api`);
  console.log(`\n📋 Default Login Credentials:`);
  console.log(`  Admin:          admin@aadhansolar.com    / Admin@123`);
  console.log(`  Manager:        manager@aadhansolar.com  / Manager@123`);
  console.log(`  Team Lead:      teamlead@aadhansolar.com / Lead@123`);
  console.log(`  Field Exec:     exec@aadhansolar.com     / Exec@123`);
  console.log(`  Finance User:   finance@aadhansolar.com  / Finance@123\n`);
}
bootstrap();
