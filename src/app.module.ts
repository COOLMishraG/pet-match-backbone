import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PetsModule } from './pets/pets.module';
import { MatchModule } from './match/match.module';

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
      synchronize: false, // Set to false when using migrations
      autoLoadEntities: true,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: true, // Run migrations automatically on startup
    }),
    AuthModule,
    UserModule,
    PetsModule,
    MatchModule,
  ],
})
export class AppModule {}
