import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { Pet } from './pets.entity';
import { promises } from 'dns';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  // Create a pet
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPetDto: Partial<Pet>, @Body('ownerId') ownerId: string) {
    return this.petsService.create(createPetDto, ownerId);
 }

  // Create a pet using owner username
  ////heres a catch that when be promis pet then it throughs an error
  @Post('by-username')
  @HttpCode(HttpStatus.CREATED)
  createByUsername(@Body() createPetDto: Partial<Pet>, @Body('ownerUsername') ownerUsername: string): Promise <Pet[]> {
    return this.petsService.createByOwnerUsername(createPetDto, ownerUsername);
  }

  // Get all pets or filter by owner
  @Get()
  async findAll(): Promise<Pet[]> {
    return this.petsService.findAll();
  }

  // Get pets by owner username
  @Get('owner/:username')
  async getPetsByOwnerUsername(@Param('username') username: string): Promise<Pet[]> {
    return this.petsService.findByOwnerUsername(username);
  }

  // Get available pets for matching
  @Get('match')
  findAvailableForMatch() {
    return this.petsService.findAvailableForMatch();
  }

  // Get available pets for boarding
  @Get('boarding')
  findAvailableForBoarding() {
    return this.petsService.findAvailableForBoarding();
  }

  // Get pet by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  // Update a pet
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePetDto: Partial<Pet>) {
    return this.petsService.update(id, updatePetDto);
  }

  // Delete a pet
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.petsService.remove(id, userId);
  }

  // Delete a pet using owner username
  @Delete(':id/by-username')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByUsername(@Param('id') id: string, @Body('ownerUsername') ownerUsername: string) {
    return this.petsService.removeByUsername(id, ownerUsername);
  }
}
