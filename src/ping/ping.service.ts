import { Injectable } from '@nestjs/common';
import { Get } from '@nestjs/common';

@Injectable()
export class PingService {
  ping(): string {
    return 'pong';
  }
}
