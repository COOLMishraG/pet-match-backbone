import { Injectable, BadRequestException } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { AnimalType } from '../pets/pets.entity';

export interface VisionAnalysisResult {
  detectedAnimal: AnimalType | null;
  confidence: number;
  allLabels: string[];
  breed?: string;
}

@Injectable()
export class VisionAiService {
  private client: ImageAnnotatorClient;

  constructor() {
    // Initialize the Vision AI client with flexible authentication
    const authConfig: any = {};
    
    if (process.env.GOOGLE_VISION_KEY_FILE) {
      // Use service account JSON file (recommended for production)
      authConfig.keyFilename = process.env.GOOGLE_VISION_KEY_FILE;
    } else if (process.env.GOOGLE_VISION_API_KEY) {
      // Use API key (simpler for development)
      authConfig.apiKey = process.env.GOOGLE_VISION_API_KEY;
    } else {
      console.warn('No Google Vision AI credentials found. Please set GOOGLE_VISION_KEY_FILE or GOOGLE_VISION_API_KEY');
    }

    this.client = new ImageAnnotatorClient(authConfig);
  }

  /**
   * Analyze an image to detect animal type and breed
   */
  async analyzeImage(imageBuffer: Buffer): Promise<VisionAnalysisResult> {
    try {
      // Call Google Vision API
      const [result] = await this.client.labelDetection({
        image: { content: imageBuffer },
      });

      const labels = result.labelAnnotations || [];
      const labelTexts = labels.map(label => label.description?.toLowerCase() || '');

      // Extract confidence scores
      const labelData = labels.map(label => ({
        text: label.description?.toLowerCase() || '',
        confidence: label.score || 0
      }));

      // Detect animal type based on labels
      const detectedAnimal = this.mapLabelsToAnimalType(labelData);
      const confidence = this.getConfidenceForAnimal(detectedAnimal, labelData);
      const breed = this.extractBreed(labelTexts, detectedAnimal);

      return {
        detectedAnimal,
        confidence,
        allLabels: labelTexts,
        breed
      };

    } catch (error) {
      console.error('Vision AI analysis failed:', error);
      throw new BadRequestException('Failed to analyze image');
    }
  }

  /**
   * Map detected labels to our AnimalType enum
   */
  private mapLabelsToAnimalType(labelData: { text: string; confidence: number }[]): AnimalType | null {
    // Define mapping with priority (higher priority = checked first)
    const animalMappings = [
      {
        type: AnimalType.DOG,
        keywords: ['dog', 'canine', 'puppy', 'hound', 'retriever', 'bulldog', 'terrier', 'shepherd'],
        priority: 1
      },
      {
        type: AnimalType.CAT,
        keywords: ['cat', 'feline', 'kitten', 'kitty', 'persian', 'siamese', 'tabby'],
        priority: 1
      },
      {
        type: AnimalType.BIRD,
        keywords: ['bird', 'avian', 'parrot', 'canary', 'cockatoo', 'parakeet', 'finch', 'pigeon'],
        priority: 1
      },
      {
        type: AnimalType.RABBIT,
        keywords: ['rabbit', 'bunny', 'hare', 'cottontail'],
        priority: 1
      },
      {
        type: AnimalType.HAMSTER,
        keywords: ['hamster', 'gerbil', 'guinea pig'],
        priority: 1
      },
      {
        type: AnimalType.FISH,
        keywords: ['fish', 'goldfish', 'tropical fish', 'aquarium'],
        priority: 1
      },
      {
        type: AnimalType.REPTILE,
        keywords: ['reptile', 'lizard', 'snake', 'turtle', 'gecko', 'iguana', 'chameleon'],
        priority: 1
      }
    ];

    // Find the best match based on keywords and confidence
    let bestMatch: { type: AnimalType; confidence: number } | null = null;

    for (const mapping of animalMappings) {
      for (const label of labelData) {
        for (const keyword of mapping.keywords) {
          if (label.text.includes(keyword)) {
            if (!bestMatch || label.confidence > bestMatch.confidence) {
              bestMatch = {
                type: mapping.type,
                confidence: label.confidence
              };
            }
          }
        }
      }
    }

    // Return the animal type if confidence is above threshold
    return bestMatch && bestMatch.confidence > 0.5 ? bestMatch.type : AnimalType.OTHER;
  }

  /**
   * Get confidence score for detected animal
   */
  private getConfidenceForAnimal(animalType: AnimalType | null, labelData: { text: string; confidence: number }[]): number {
    if (!animalType) return 0;

    const relevantLabels = labelData.filter(label => {
      switch (animalType) {
        case AnimalType.DOG:
          return label.text.includes('dog') || label.text.includes('canine');
        case AnimalType.CAT:
          return label.text.includes('cat') || label.text.includes('feline');
        case AnimalType.BIRD:
          return label.text.includes('bird') || label.text.includes('avian');
        case AnimalType.RABBIT:
          return label.text.includes('rabbit') || label.text.includes('bunny');
        case AnimalType.HAMSTER:
          return label.text.includes('hamster') || label.text.includes('rodent');
        case AnimalType.FISH:
          return label.text.includes('fish');
        case AnimalType.REPTILE:
          return label.text.includes('reptile') || label.text.includes('lizard');
        default:
          return false;
      }
    });

    return relevantLabels.length > 0 ? Math.max(...relevantLabels.map(l => l.confidence)) : 0;
  }

  /**
   * Extract breed information from labels
   */
  private extractBreed(labels: string[], animalType: AnimalType | null): string | undefined {
    if (!animalType) return undefined;

    // Common breed keywords for different animals
    const breedKeywords = {
      [AnimalType.DOG]: [
        'golden retriever', 'labrador', 'bulldog', 'german shepherd', 'poodle',
        'beagle', 'rottweiler', 'yorkshire terrier', 'boxer', 'husky', 'chihuahua'
      ],
      [AnimalType.CAT]: [
        'persian', 'siamese', 'maine coon', 'british shorthair', 'ragdoll',
        'bengal', 'abyssinian', 'russian blue', 'scottish fold'
      ],
      [AnimalType.BIRD]: [
        'parrot', 'canary', 'cockatoo', 'parakeet', 'finch', 'budgie', 'macaw'
      ]
    };

    const keywords = breedKeywords[animalType] || [];
    
    for (const label of labels) {
      for (const breed of keywords) {
        if (label.includes(breed)) {
          return breed;
        }
      }
    }

    return undefined;
  }

  /**
   * Analyze image from URL
   */
  async analyzeImageFromUrl(imageUrl: string): Promise<VisionAnalysisResult> {
    try {
      const [result] = await this.client.labelDetection({
        image: { source: { imageUri: imageUrl } },
      });

      const labels = result.labelAnnotations || [];
      const labelTexts = labels.map(label => label.description?.toLowerCase() || '');
      const labelData = labels.map(label => ({
        text: label.description?.toLowerCase() || '',
        confidence: label.score || 0
      }));

      const detectedAnimal = this.mapLabelsToAnimalType(labelData);
      const confidence = this.getConfidenceForAnimal(detectedAnimal, labelData);
      const breed = this.extractBreed(labelTexts, detectedAnimal);

      return {
        detectedAnimal,
        confidence,
        allLabels: labelTexts,
        breed
      };

    } catch (error) {
      console.error('Vision AI analysis failed:', error);
      throw new BadRequestException('Failed to analyze image from URL');
    }
  }
}
