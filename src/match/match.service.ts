import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { Pet, PetGender } from '../pets/pets.entity';
import { User } from '../user/user.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Find pets available for breeding
  async findAvailablePets(userId: string, petId?: string): Promise<Pet[]> {
    // Get user's information to exclude their own pets
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If petId is provided, get breed and gender information
    let breed: string | undefined;
    let oppositeGender: PetGender | undefined;
    
    if (petId) {
      const pet = await this.petRepository.findOne({ where: { id: petId } });
      if (!pet) {
        throw new NotFoundException(`Pet with ID ${petId} not found`);
      }

      // If filtering by pet, find opposite gender pets of the same breed
      breed = pet.breed;
      oppositeGender = pet.gender === PetGender.MALE ? PetGender.FEMALE : PetGender.MALE;
    }

    // Find all pets that are available for matching, excluding the user's own pets
    const petsQuery = this.petRepository.createQueryBuilder('pet')
      .innerJoinAndSelect('pet.owner', 'owner')
      .where('pet.isAvailableForMatch = :isAvailable', { isAvailable: true })
      .andWhere('owner.id != :userId', { userId });
      
    // Add breed filter if provided
    if (breed) {
      petsQuery.andWhere('pet.breed = :breed', { breed });
    }
    
    // Add gender filter if provided
    if (oppositeGender) {
      petsQuery.andWhere('pet.gender = :gender', { gender: oppositeGender });
    }
      
    return petsQuery.getMany();
  }

  // Find pets available for breeding by username
  async findAvailablePetsByUsername(username: string, petId?: string): Promise<Pet[]> {
    // Get user's information to exclude their own pets
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    // If petId is provided, get breed and gender information
    let breed: string | undefined;
    let oppositeGender: PetGender | undefined;
    
    if (petId) {
      const pet = await this.petRepository.findOne({ where: { id: petId } });
      if (!pet) {
        throw new NotFoundException(`Pet with ID ${petId} not found`);
      }

      // If filtering by pet, find opposite gender pets of the same breed
      breed = pet.breed;
      oppositeGender = pet.gender === PetGender.MALE ? PetGender.FEMALE : PetGender.MALE;
    }

    // Find all pets that are available for matching, excluding the user's own pets
    const petsQuery = this.petRepository.createQueryBuilder('pet')
      .innerJoinAndSelect('pet.owner', 'owner')
      .where('pet.isAvailableForMatch = :isAvailable', { isAvailable: true })
      .andWhere('owner.username != :username', { username });
      
    // Add breed filter if provided
    if (breed) {
      petsQuery.andWhere('pet.breed = :breed', { breed });
    }
    
    // Add gender filter if provided
    if (oppositeGender) {
      petsQuery.andWhere('pet.gender = :gender', { gender: oppositeGender });
    }
      
    return petsQuery.getMany();
  }

  // Send a match request
  async createMatchRequest(
    requesterId: string, 
    requesterPetId: string, 
    recipientId: string,
    recipientPetId: string,
    message?: string
  ): Promise<Match> {
    // Check if both users exist
    const [requester, recipient] = await Promise.all([
      this.userRepository.findOne({ where: { id: requesterId } }),
      this.userRepository.findOne({ where: { id: recipientId } })
    ]);

    if (!requester || !recipient) {
      throw new NotFoundException('One or both users not found');
    }

    // Check if both pets exist and are available for matching
    const [requesterPet, recipientPet] = await Promise.all([
      this.petRepository.findOne({ 
        where: { id: requesterPetId, owner: { id: requesterId } },
        relations: ['owner']
      }),
      this.petRepository.findOne({ 
        where: { id: recipientPetId, owner: { id: recipientId }, isAvailableForMatch: true },
        relations: ['owner']
      })
    ]);

    if (!requesterPet || !recipientPet) {
      throw new NotFoundException('One or both pets not found or not available for matching');
    }

    // Check if pets are compatible (different genders)
    if (requesterPet.gender === recipientPet.gender) {
      throw new BadRequestException('Pets must be of opposite genders for breeding');
    }

    // Check if the match request already exists
    const existingRequest = await this.matchRepository.findOne({
      where: [
        { 
          requesterPet: { id: requesterPetId }, 
          recipientPet: { id: recipientPetId },
          status: MatchStatus.PENDING 
        },
        { 
          requesterPet: { id: recipientPetId }, 
          recipientPet: { id: requesterPetId },
          status: MatchStatus.PENDING 
        }
      ],
    });

    if (existingRequest) {
      throw new ConflictException('A match request already exists between these pets');
    }

    // Create and save the match request
    const matchRequest = this.matchRepository.create({
      requester,
      recipient,
      requesterPet,
      recipientPet,
      message,
      status: MatchStatus.PENDING
    });

    return this.matchRepository.save(matchRequest);
  }

  // Send a match request using usernames
  async createMatchRequestByUsername(
    requesterUsername: string, 
    requesterPetId: string, 
    recipientUsername: string,
    recipientPetId: string,
    message?: string
  ): Promise<Match> {
    // Check if both users exist
    const [requester, recipient] = await Promise.all([
      this.userRepository.findOne({ where: { username: requesterUsername } }),
      this.userRepository.findOne({ where: { username: recipientUsername } })
    ]);

    if (!requester || !recipient) {
      throw new NotFoundException('One or both users not found');
    }

    // Check if both pets exist and are available for matching
    const [requesterPet, recipientPet] = await Promise.all([
      this.petRepository.findOne({ 
        where: { id: requesterPetId, owner: { id: requester.id } },
        relations: ['owner']
      }),
      this.petRepository.findOne({ 
        where: { id: recipientPetId, owner: { id: recipient.id }, isAvailableForMatch: true },
        relations: ['owner']
      })
    ]);

    if (!requesterPet || !recipientPet) {
      throw new NotFoundException('One or both pets not found or not available for matching');
    }

    // Check if pets are compatible (different genders)
    if (requesterPet.gender === recipientPet.gender) {
      throw new BadRequestException('Pets must be of opposite genders for breeding');
    }

    // Check if the match request already exists
    const existingRequest = await this.matchRepository.findOne({
      where: [
        { 
          requesterPet: { id: requesterPetId }, 
          recipientPet: { id: recipientPetId },
          status: MatchStatus.PENDING 
        },
        { 
          requesterPet: { id: recipientPetId }, 
          recipientPet: { id: requesterPetId },
          status: MatchStatus.PENDING 
        }
      ],
    });

    if (existingRequest) {
      throw new ConflictException('A match request already exists between these pets');
    }

    // Create and save the match request
    const matchRequest = this.matchRepository.create({
      requester,
      recipient,
      requesterPet,
      recipientPet,
      message,
      status: MatchStatus.PENDING
    });

    return this.matchRepository.save(matchRequest);
  }

  // Get match requests sent by a user
  async getSentRequests(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { requester: { id: userId } },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get match requests received by a user
  async getReceivedRequests(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { recipient: { id: userId } },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get pending match requests received by a user
  async getPendingReceivedRequests(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { 
        recipient: { id: userId },
        status: MatchStatus.PENDING
      },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get approved matches for a user
  async getApprovedMatches(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        { requester: { id: userId }, status: MatchStatus.APPROVED },
        { recipient: { id: userId }, status: MatchStatus.APPROVED }
      ],
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get match requests sent by username
  async getSentRequestsByUsername(username: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { requester: { username } },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get match requests received by username
  async getReceivedRequestsByUsername(username: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { recipient: { username } },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get pending match requests received by username
  async getPendingReceivedRequestsByUsername(username: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { 
        recipient: { username },
        status: MatchStatus.PENDING
      },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Get approved matches for a username
  async getApprovedMatchesByUsername(username: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        { requester: { username }, status: MatchStatus.APPROVED },
        { recipient: { username }, status: MatchStatus.APPROVED }
      ],
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });
  }

  // Respond to a match request (approve or reject)
  async respondToMatchRequest(matchId: string, userId: string, approve: boolean): Promise<Match> {
    // Find the match request
    const match = await this.matchRepository.findOne({
      where: { id: matchId, recipient: { id: userId } },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });

    if (!match) {
      throw new NotFoundException(`Match request with ID ${matchId} not found or you're not authorized to respond`);
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException('This match request has already been processed');
    }

    // Update the status based on the response
    match.status = approve ? MatchStatus.APPROVED : MatchStatus.REJECTED;
    
    return this.matchRepository.save(match);
  }

  // Respond to a match request by username
  async respondToMatchRequestByUsername(matchId: string, username: string, approve: boolean): Promise<Match> {
    // Find the match request
    const match = await this.matchRepository.findOne({
      where: { id: matchId, recipient: { username } },
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });

    if (!match) {
      throw new NotFoundException(`Match request with ID ${matchId} not found or you're not authorized to respond`);
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException('This match request has already been processed');
    }

    // Update the status based on the response
    match.status = approve ? MatchStatus.APPROVED : MatchStatus.REJECTED;
    
    return this.matchRepository.save(match);
  }

  // Get specific match details
  async getMatchById(matchId: string, userId: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: [
        { id: matchId, requester: { id: userId } },
        { id: matchId, recipient: { id: userId } }
      ],
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found or you're not authorized to view it`);
    }

    return match;
  }

  // Get specific match details by username
  async getMatchByIdAndUsername(matchId: string, username: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: [
        { id: matchId, requester: { username } },
        { id: matchId, recipient: { username } }
      ],
      relations: ['requester', 'recipient', 'requesterPet', 'recipientPet'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found or you're not authorized to view it`);
    }

    return match;
  }
}
