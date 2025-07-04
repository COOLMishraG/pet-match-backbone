import { Module } from '@nestjs/common';
import { VisionAiService } from './vision-ai.service';

@Module({
  providers: [VisionAiService],
  exports: [VisionAiService],
})
export class VisionAiModule {}
