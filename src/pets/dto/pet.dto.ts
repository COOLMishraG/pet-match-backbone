import { IsNotEmpty, IsString, IsInt, IsEnum, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { AnimalType, PetGender } from '../pets.entity';

export class CreatePetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(AnimalType)
  animal: AnimalType;

  @IsNotEmpty()
  @IsString()
  breed: string;

  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @IsNotEmpty()
  @IsEnum(PetGender)
  gender: PetGender;

  @IsOptional()
  @IsBoolean()
  vaccinated?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isAvailableForMatch?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailableForBoarding?: boolean;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AnimalType)
  animal?: AnimalType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  age?: number;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsBoolean()
  vaccinated?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isAvailableForMatch?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailableForBoarding?: boolean;
}
