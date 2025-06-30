import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet, AnimalType, PetGender } from './pets.entity';
import { User } from '../user/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PetsService', () => {
  let service: PetsService;
  let petRepository: Repository<Pet>;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@example.com',
    password: null as any,
    phone: null as any,
    location: null as any,
    role: 'OWNER' as any,
    profileImage: null as any,
    isVerified: false,
    googleId: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPet: Pet = {
    id: '1',
    name: 'Buddy',
    animal: AnimalType.DOG,
    breed: 'Golden Retriever',
    age: 3,
    gender: PetGender.MALE,
    vaccinated: true,
    description: 'Friendly dog',
    imageUrl: 'http://example.com/image.jpg',
    owner: mockUser,
    location: 'New York',
    isAvailableForMatch: true,
    isAvailableForBoarding: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: getRepositoryToken(Pet),
          useValue: mockPetRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
    petRepository = module.get<Repository<Pet>>(getRepositoryToken(Pet));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a pet successfully with animal type', async () => {
      const petData = {
        name: 'Buddy',
        animal: AnimalType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPetRepository.create.mockReturnValue(mockPet);
      mockPetRepository.save.mockResolvedValue(mockPet);

      const result = await service.create(petData, '1');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(petRepository.create).toHaveBeenCalledWith({
        ...petData,
        owner: mockUser,
      });
      expect(petRepository.save).toHaveBeenCalledWith(mockPet);
      expect(result).toEqual(mockPet);
    });

    it('should throw BadRequestException when animal type is missing', async () => {
      const petData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
      };

      await expect(service.create(petData, '1')).rejects.toThrow(
        new BadRequestException('Animal type is required')
      );

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(petRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is missing', async () => {
      const petData = {
        animal: AnimalType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
      };

      await expect(service.create(petData, '1')).rejects.toThrow(
        new BadRequestException('Pet name is required')
      );

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(petRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when owner does not exist', async () => {
      const petData = {
        name: 'Buddy',
        animal: AnimalType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(petData, '1')).rejects.toThrow(
        new NotFoundException('User with ID 1 not found')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(petRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('createByOwnerUsername', () => {
    it('should create a pet successfully with animal type using username', async () => {
      const petData = {
        name: 'Whiskers',
        animal: AnimalType.CAT,
        breed: 'Persian',
        age: 2,
        gender: PetGender.FEMALE,
      };

      const catPet = { ...mockPet, ...petData };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPetRepository.create.mockReturnValue(catPet);
      mockPetRepository.save.mockResolvedValue(catPet);

      const result = await service.createByOwnerUsername(petData, 'testuser');

      expect(userRepository.findOne).toHaveBeenCalledWith({ 
        where: { username: 'testuser' } 
      });
      expect(petRepository.create).toHaveBeenCalledWith({
        ...petData,
        owner: mockUser,
      });
      expect(petRepository.save).toHaveBeenCalledWith(catPet);
      expect(result).toEqual(catPet);
    });

    it('should throw BadRequestException when animal type is missing in createByOwnerUsername', async () => {
      const petData = {
        name: 'Whiskers',
        breed: 'Persian',
        age: 2,
        gender: PetGender.FEMALE,
      };

      await expect(service.createByOwnerUsername(petData, 'testuser')).rejects.toThrow(
        new BadRequestException('Animal type is required')
      );

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(petRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when owner username does not exist', async () => {
      const petData = {
        name: 'Whiskers',
        animal: AnimalType.CAT,
        breed: 'Persian',
        age: 2,
        gender: PetGender.FEMALE,
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createByOwnerUsername(petData, 'nonexistent')).rejects.toThrow(
        new NotFoundException('User with username nonexistent not found')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ 
        where: { username: 'nonexistent' } 
      });
      expect(petRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('AnimalType enum', () => {
    it('should support all animal types', () => {
      const expectedAnimalTypes = [
        'DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'
      ];

      const actualAnimalTypes = Object.values(AnimalType);
      
      expect(actualAnimalTypes).toEqual(expectedAnimalTypes);
      expect(actualAnimalTypes.length).toBe(8);
    });

    it('should create pets with different animal types', async () => {
      const animalTypes = [
        AnimalType.DOG,
        AnimalType.CAT,
        AnimalType.BIRD,
        AnimalType.RABBIT,
        AnimalType.HAMSTER,
        AnimalType.FISH,
        AnimalType.REPTILE,
        AnimalType.OTHER,
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPetRepository.create.mockReturnValue(mockPet);
      mockPetRepository.save.mockResolvedValue(mockPet);

      for (const animalType of animalTypes) {
        const petData = {
          name: `Pet${animalType}`,
          animal: animalType,
          breed: 'Test Breed',
          age: 1,
          gender: PetGender.MALE,
        };

        await service.create(petData, '1');

        expect(petRepository.create).toHaveBeenCalledWith({
          ...petData,
          owner: mockUser,
        });
      }

      expect(petRepository.create).toHaveBeenCalledTimes(animalTypes.length);
    });
  });
});
