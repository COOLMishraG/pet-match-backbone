import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitterSpecController } from './sitter-spec.controller';
import { SitterSpecService } from './sitter-spec.service';
import { SitterSpec } from './sitter-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SitterSpec])],
  controllers: [SitterSpecController],
  providers: [SitterSpecService],
  exports: [SitterSpecService] // Export so it can be used in UserModule
})
export class SitterSpecModule {}
