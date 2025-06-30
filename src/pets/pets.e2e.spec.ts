import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { AnimalType, PetGender } from './pets.entity';

describe('Pets API - Animal Property Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pets', () => {
    it('should create a pet with valid animal type', async () => {
      const createPetDto = {
        name: 'Buddy',
        animal: AnimalType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
        vaccinated: true,
        description: 'Friendly dog',
        ownerId: 'test-user-id',
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .send(createPetDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Buddy',
        animal: 'DOG',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'MALE',
        vaccinated: true,
        description: 'Friendly dog',
      });
    });

    it('should reject pet creation without animal type', async () => {
      const createPetDto = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
        ownerId: 'test-user-id',
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .send(createPetDto)
        .expect(400);

      expect(response.body.message).toContain('animal');
    });

    it('should reject pet creation with invalid animal type', async () => {
      const createPetDto = {
        name: 'Buddy',
        animal: 'INVALID_ANIMAL',
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
        ownerId: 'test-user-id',
      };

      const response = await request(app.getHttpServer())
        .post('/pets')
        .send(createPetDto)
        .expect(400);

      expect(response.body.message).toContain('animal');
    });

    it('should create pets with all supported animal types', async () => {
      const animalTypes = Object.values(AnimalType);

      for (const animalType of animalTypes) {
        const createPetDto = {
          name: `${animalType} Pet`,
          animal: animalType,
          breed: `${animalType} Breed`,
          age: 2,
          gender: PetGender.MALE,
          ownerId: 'test-user-id',
        };

        const response = await request(app.getHttpServer())
          .post('/pets')
          .send(createPetDto)
          .expect(201);

        expect(response.body.animal).toBe(animalType);
      }
    });
  });

  describe('POST /pets/by-username', () => {
    it('should create a pet by username with valid animal type', async () => {
      const createPetDto = {
        name: 'Whiskers',
        animal: AnimalType.CAT,
        breed: 'Persian',
        age: 2,
        gender: PetGender.FEMALE,
        ownerUsername: 'test-user',
      };

      const response = await request(app.getHttpServer())
        .post('/pets/by-username')
        .send(createPetDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Whiskers',
        animal: 'CAT',
        breed: 'Persian',
        age: 2,
        gender: 'FEMALE',
      });
    });

    it('should reject pet creation by username without animal type', async () => {
      const createPetDto = {
        name: 'Whiskers',
        breed: 'Persian',
        age: 2,
        gender: PetGender.FEMALE,
        ownerUsername: 'test-user',
      };

      const response = await request(app.getHttpServer())
        .post('/pets/by-username')
        .send(createPetDto)
        .expect(400);

      expect(response.body.message).toContain('animal');
    });
  });

  describe('PATCH /pets/:id', () => {
    it('should update pet animal type', async () => {
      // First create a pet
      const createPetDto = {
        name: 'Buddy',
        animal: AnimalType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        gender: PetGender.MALE,
        ownerId: 'test-user-id',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/pets')
        .send(createPetDto)
        .expect(201);

      const petId = createResponse.body.id;

      // Then update the animal type
      const updatePetDto = {
        animal: AnimalType.CAT,
      };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/pets/${petId}`)
        .send(updatePetDto)
        .expect(200);

      expect(updateResponse.body.animal).toBe('CAT');
    });

    it('should reject update with invalid animal type', async () => {
      const updatePetDto = {
        animal: 'INVALID_ANIMAL',
      };

      const response = await request(app.getHttpServer())
        .patch('/pets/test-pet-id')
        .send(updatePetDto)
        .expect(400);

      expect(response.body.message).toContain('animal');
    });
  });

  describe('GET /pets', () => {
    it('should return pets with animal types', async () => {
      const response = await request(app.getHttpServer())
        .get('/pets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('animal');
        expect(Object.values(AnimalType)).toContain(response.body[0].animal);
      }
    });
  });
});
