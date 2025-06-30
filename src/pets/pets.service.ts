import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet, AnimalType } from './pets.entity';
import { User } from '../user/user.entity';
import { VisionAiService } from '../vision-ai/vision-ai.service';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private visionAiService: VisionAiService,
  ) {}

  // Create a new pet
  async create(petData: Partial<Pet>, ownerId: string): Promise<Pet> {
    // Check if pet name is provided
    if (!petData.name) {
      throw new BadRequestException('Pet name is required');
    }
    
    // Check if animal type is provided
    if (!petData.animal) {
      throw new BadRequestException('Animal type is required');
    }
    
    // Check if owner exists
    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    const newPet = this.petsRepository.create({
      ...petData,
      owner
    });
    
    return await this.petsRepository.save(newPet);
  }  // Create a new pet by owner username
  async createByOwnerUsername(petData: Partial<Pet>, ownerUsername: string): Promise<Pet> {
    // Check if pet name is provided
    if (!petData.name) {
      throw new BadRequestException('Pet name is required');
    }
    
    // Check if animal type is provided
    if (!petData.animal) {
      throw new BadRequestException('Animal type is required');
    }
    
    // Check if username is provided
    if (!ownerUsername) {
      throw new BadRequestException('Owner username is required');
    }

    // Check if owner exists
    const owner = await this.usersRepository.findOne({ where: { username: ownerUsername } });
    if (!owner) {
      throw new NotFoundException(`User with username ${ownerUsername} not found`);
    }    // Remove ownerId property if it exists to avoid confusion
    const { ownerId, ...cleanPetData } = petData as any;
    
    const newPet = this.petsRepository.create({
      ...cleanPetData,
      owner
    });
    
    // Save the pet entity and handle array or single object
    const savedPet = await this.petsRepository.save(newPet);
    return Array.isArray(savedPet) ? savedPet[0] : savedPet;
  }

  // Get all pets
  async findAll(): Promise<Pet[]> {
    return this.petsRepository.find({
      relations: ['owner']
    });
  }

  // Get pets by owner
  async findByOwner(ownerId: string): Promise<Pet[]> {
    return this.petsRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner']
    });
  }

  // Get pets by owner username
  async findByOwnerUsername(ownerUsername: string): Promise<Pet[]> {
    const owner = await this.usersRepository.findOne({ 
      where: { username: ownerUsername } 
    });
    
    if (!owner) {
      throw new NotFoundException(`User with username ${ownerUsername} not found`);
    }
    
    return this.petsRepository.find({
      where: { owner: { id: owner.id } },
      relations: ['owner']
    });
  }

  // Get pet by id
  async findOne(id: string): Promise<Pet> {
    const pet = await this.petsRepository.findOne({ 
      where: { id },
      relations: ['owner']
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    
    return pet;
  }

  // Update a pet
  async update(id: string, updateData: Partial<Pet>): Promise<Pet> {
    // Check if pet exists
    await this.findOne(id);
    
    await this.petsRepository.update(id, updateData);
    
    // Return updated pet
    return this.findOne(id);
  }

  // Delete a pet
  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.findOne(id);
    
    // Check if user is the owner
    if (pet.owner.id !== userId) {
      throw new BadRequestException('You can only delete your own pets');
    }
    
    const result = await this.petsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
  }

  // Delete a pet with username authorization
  async removeByUsername(id: string, ownerUsername: string): Promise<void> {
    const pet = await this.findOne(id);
    const owner = await this.usersRepository.findOne({ where: { username: ownerUsername } });
    
    if (!owner) {
      throw new NotFoundException(`User with username ${ownerUsername} not found`);
    }
    
    // Check if user is the owner
    if (pet.owner.id !== owner.id) {
      throw new BadRequestException('You can only delete your own pets');
    }
    
    const result = await this.petsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
  }

  // Find pets available for matching
  async findAvailableForMatch(): Promise<Pet[]> {
    return this.petsRepository.find({
      where: { isAvailableForMatch: true },
      relations: ['owner']
    });
  }

  // Find pets available for boarding
  async findAvailableForBoarding(): Promise<Pet[]> {
    return this.petsRepository.find({
      where: { isAvailableForBoarding: true },
      relations: ['owner']
    });
  }

  /**
   * Analyze image to detect animal type and breed
   */
  async analyzeImageForAnimal(imageBuffer: Buffer): Promise<{
    suggestedAnimal: AnimalType;
    confidence: number;
    suggestedBreed?: string;
    allLabels: string[];
  }> {
    const analysis = await this.visionAiService.analyzeImage(imageBuffer);
    
    return {
      suggestedAnimal: analysis.detectedAnimal || AnimalType.OTHER,
      confidence: analysis.confidence,
      suggestedBreed: analysis.breed,
      allLabels: analysis.allLabels
    };
  }

  /**
   * Analyze image from URL to detect animal type and breed
   */
  async analyzeImageUrlForAnimal(imageUrl: string): Promise<{
    suggestedAnimal: AnimalType;
    confidence: number;
    suggestedBreed?: string;
    allLabels: string[];
  }> {
    const analysis = await this.visionAiService.analyzeImageFromUrl(imageUrl);
    
    return {
      suggestedAnimal: analysis.detectedAnimal || AnimalType.OTHER,
      confidence: analysis.confidence,
      suggestedBreed: analysis.breed,
      allLabels: analysis.allLabels
    };
  }

  /**
   * Create a pet with automatic animal detection from image
   */
  async createWithImageAnalysis(
    petData: Partial<Pet>, 
    ownerId: string, 
    imageBuffer?: Buffer,
    imageUrl?: string
  ): Promise<Pet & { aiAnalysis?: any }> {
    // Check if pet name is provided
    if (!petData.name) {
      throw new BadRequestException('Pet name is required');
    }
    
    let aiAnalysis: {
      suggestedAnimal: AnimalType;
      confidence: number;
      suggestedBreed?: string;
      allLabels: string[];
    } | null = null;
    let finalPetData = { ...petData };

    // If no animal type provided, try to detect from image
    if (!petData.animal && (imageBuffer || imageUrl)) {
      try {
        if (imageBuffer) {
          aiAnalysis = await this.analyzeImageForAnimal(imageBuffer);
        } else if (imageUrl) {
          aiAnalysis = await this.analyzeImageUrlForAnimal(imageUrl);
        }

        // Auto-set animal type if confidence is high enough
        if (aiAnalysis && aiAnalysis.confidence > 0.7) {
          finalPetData.animal = aiAnalysis.suggestedAnimal;
          
          // Auto-set breed if detected and not provided
          if (!finalPetData.breed && aiAnalysis.suggestedBreed) {
            finalPetData.breed = aiAnalysis.suggestedBreed;
          }
        }
      } catch (error) {
        console.warn('Image analysis failed, proceeding without AI detection:', error);
      }
    }
    
    // Check if animal type is provided (either manually or from AI)
    if (!finalPetData.animal) {
      throw new BadRequestException('Animal type is required. Provide manually or upload a clear pet image for auto-detection.');
    }
    
    // Check if owner exists
    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    const newPet = this.petsRepository.create({
      ...finalPetData,
      owner
    });
    
    const savedPet = await this.petsRepository.save(newPet);

    // Return pet with AI analysis info
    return {
      ...savedPet,
      aiAnalysis: aiAnalysis ? {
        detectedAnimal: aiAnalysis.suggestedAnimal,
        confidence: aiAnalysis.confidence,
        suggestedBreed: aiAnalysis.suggestedBreed,
        wasAutoDetected: !petData.animal
      } : undefined
    };
  }
}
