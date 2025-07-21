import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with origin validation
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',     // Local development
        'http://localhost:5173',     // Vite dev server
      ];
      
      // Allow any URL from your Vercel domain
      const vercelDomain = 'pet-match-iota.vercel.app';
      
      if (!origin || 
          allowedOrigins.includes(origin) || 
          origin.endsWith(vercelDomain)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//hello world
