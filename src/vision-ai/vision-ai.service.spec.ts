import { Test, TestingModule } from '@nestjs/testing';
import { VisionAiService } from './vision-ai.service';
import { AnimalType } from '../pets/pets.entity';

describe('VisionAiService', () => {
  let service: VisionAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisionAiService],
    }).compile();

    service = module.get<VisionAiService>(VisionAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapLabelsToAnimalType', () => {
    it('should map dog labels correctly', () => {
      const labelData = [
        { text: 'dog', confidence: 0.95 },
        { text: 'golden retriever', confidence: 0.87 },
        { text: 'canine', confidence: 0.82 }
      ];

      const result = service['mapLabelsToAnimalType'](labelData);
      expect(result).toBe(AnimalType.DOG);
    });

    it('should map cat labels correctly', () => {
      const labelData = [
        { text: 'cat', confidence: 0.92 },
        { text: 'feline', confidence: 0.85 },
        { text: 'persian', confidence: 0.78 }
      ];

      const result = service['mapLabelsToAnimalType'](labelData);
      expect(result).toBe(AnimalType.CAT);
    });

    it('should return OTHER for unknown animals', () => {
      const labelData = [
        { text: 'vehicle', confidence: 0.95 },
        { text: 'car', confidence: 0.87 }
      ];

      const result = service['mapLabelsToAnimalType'](labelData);
      expect(result).toBe(AnimalType.OTHER);
    });

    it('should return OTHER for low confidence', () => {
      const labelData = [
        { text: 'dog', confidence: 0.3 }, // Below threshold
        { text: 'animal', confidence: 0.4 }
      ];

      const result = service['mapLabelsToAnimalType'](labelData);
      expect(result).toBe(AnimalType.OTHER);
    });
  });

  describe('extractBreed', () => {
    it('should extract dog breeds', () => {
      const labels = ['dog', 'golden retriever', 'canine'];
      const result = service['extractBreed'](labels, AnimalType.DOG);
      expect(result).toBe('golden retriever');
    });

    it('should extract cat breeds', () => {
      const labels = ['cat', 'persian', 'feline'];
      const result = service['extractBreed'](labels, AnimalType.CAT);
      expect(result).toBe('persian');
    });

    it('should return undefined for unknown breeds', () => {
      const labels = ['dog', 'unknown breed', 'canine'];
      const result = service['extractBreed'](labels, AnimalType.DOG);
      expect(result).toBeUndefined();
    });
  });

  describe('getConfidenceForAnimal', () => {
    it('should return highest confidence for matching animal', () => {
      const labelData = [
        { text: 'dog', confidence: 0.95 },
        { text: 'canine', confidence: 0.87 },
        { text: 'animal', confidence: 0.75 }
      ];

      const result = service['getConfidenceForAnimal'](AnimalType.DOG, labelData);
      expect(result).toBe(0.95);
    });

    it('should return 0 for no matching labels', () => {
      const labelData = [
        { text: 'vehicle', confidence: 0.95 },
        { text: 'car', confidence: 0.87 }
      ];

      const result = service['getConfidenceForAnimal'](AnimalType.DOG, labelData);
      expect(result).toBe(0);
    });
  });
});
