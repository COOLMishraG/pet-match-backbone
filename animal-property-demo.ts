// Simple test to verify the animal property implementation
import { AnimalType, PetGender } from './src/pets/pets.entity';

// Test data demonstrating the new animal property requirement
const validPetData = {
  name: 'Buddy',
  animal: AnimalType.DOG, // This is now REQUIRED
  breed: 'Golden Retriever',
  age: 3,
  gender: PetGender.MALE,
  vaccinated: true,
  description: 'Friendly dog',
  location: 'New York',
  isAvailableForMatch: true,
  isAvailableForBoarding: false,
};

const invalidPetData = {
  name: 'Buddy',
  // animal: missing - this will cause validation error
  breed: 'Golden Retriever', 
  age: 3,
  gender: PetGender.MALE,
};

console.log('✅ Valid pet data:', validPetData);
console.log('❌ Invalid pet data (missing animal):', invalidPetData);

// All supported animal types
console.log('🐾 Supported animal types:', Object.values(AnimalType));

export { validPetData, invalidPetData };
