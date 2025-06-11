import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all routes
  app.enableCors({
    origin: true, // Allow all origins, can be set to specific domain(s) in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow cookies to be sent with requests
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//hello world
