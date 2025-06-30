import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PetsModule } from './pets/pets.module';
import { MatchModule } from './match/match.module';
import { VisionAiModule } from './vision-ai/vision-ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: false, // Set back to false for production safety
      autoLoadEntities: true,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: true, // Run migrations automatically on startup
      logging: ['error', 'warn', 'info', 'log'], // Enable detailed logging
      logger: 'advanced-console', // Use advanced console logger
    }),
    AuthModule,
    UserModule,
    PetsModule,
    MatchModule,
    VisionAiModule,
  ],
})
export class AppModule {}
