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
  Query,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PetsService } from './pets.service';
import { Pet } from './pets.entity';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  // Create a pet
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createPetDto: CreatePetDto, @Body('ownerId') ownerId: string) {
    return this.petsService.create(createPetDto, ownerId);
 }  // Create a pet using owner username
  @Post('by-username')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  createByUsername(@Body() createPetDto: CreatePetDto, @Body('ownerUsername') ownerUsername: string): Promise<Pet> {
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
  findAvailableForMatching() {
    return this.petsService.findAvailableForBoarding();
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
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
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

  // Analyze image to detect animal type
  @Post('analyze-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    
    return this.petsService.analyzeImageForAnimal(file.buffer);
  }

  // Analyze image URL to detect animal type
  @Post('analyze-image-url')
  @HttpCode(HttpStatus.OK)
  async analyzeImageUrl(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }
    
    return this.petsService.analyzeImageUrlForAnimal(imageUrl);
  }

  // Create a pet with AI-powered image analysis
  @Post('create-with-ai')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('image'))
  async createWithAI(
    @Body() createPetDto: Partial<CreatePetDto>, 
    @Body('ownerId') ownerId: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.petsService.createWithImageAnalysis(
      createPetDto, 
      ownerId, 
      file?.buffer
    );
  }

  // Create a pet with AI-powered image analysis from URL
  @Post('create-with-ai-url')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWithAIFromUrl(
    @Body() body: Partial<CreatePetDto> & { ownerId: string; imageUrl?: string }
  ) {
    const { ownerId, imageUrl, ...createPetDto } = body;
    
    return this.petsService.createWithImageAnalysis(
      createPetDto, 
      ownerId, 
      undefined,
      imageUrl
    );
  }
}
