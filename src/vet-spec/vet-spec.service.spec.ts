import { Test, TestingModule } from '@nestjs/testing';
import { VetSpecService } from './vet-spec.service';

describe('VetSpecService', () => {
  let service: VetSpecService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VetSpecService],
    }).compile();

    service = module.get<VetSpecService>(VetSpecService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
