import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Important for Neon SSL
      },
      synchronize: true, // Only for dev
      autoLoadEntities: true,
        logging: true,
  logger: 'advanced-console'
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
