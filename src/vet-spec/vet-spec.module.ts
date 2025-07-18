import { Module } from '@nestjs/common';
import { VetSpecController } from './vet-spec.controller';
import { VetSpecService } from './vet-spec.service';

@Module({
  controllers: [VetSpecController],
  providers: [VetSpecService]
})
export class VetSpecModule {}
