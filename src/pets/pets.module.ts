import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { Pet } from './pets.entity';
import { User } from '../user/user.entity';
import { VisionAiModule } from '../vision-ai/vision-ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet, User]),
    VisionAiModule
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService]
})
export class PetsModule {}
