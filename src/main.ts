import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for specific origins
  app.enableCors({
    origin: [
      'http://localhost:3000',     // Local development
      'http://localhost:5173',     // Vite dev server
      process.env.FRONTEND_URL, // Vercel frontend URL
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//hello world
