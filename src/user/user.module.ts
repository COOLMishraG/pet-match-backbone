import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { SitterSpecModule } from '../sitter-spec/sitter-spec.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SitterSpecModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
