import { Test, TestingModule } from '@nestjs/testing';
import { VetSpecController } from './vet-spec.controller';

describe('VetSpecController', () => {
  let controller: VetSpecController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VetSpecController],
    }).compile();

    controller = module.get<VetSpecController>(VetSpecController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
