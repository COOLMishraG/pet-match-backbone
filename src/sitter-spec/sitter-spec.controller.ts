import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { SitterSpecService } from './sitter-spec.service';
import { CreateSitterSpecDto, UpdateSitterSpecDto } from './dto/sitter-spec.dto';

@Controller('sitter-spec')
export class SitterSpecController {
  constructor(private readonly sitterSpecService: SitterSpecService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSitterSpecDto: CreateSitterSpecDto) {
    return this.sitterSpecService.createSitterSpec(createSitterSpecDto.userName);
  }

  @Get()
  async findAll() {
    return this.sitterSpecService.findAll();
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return this.sitterSpecService.findByUsername(username);
  }

  @Patch(':username')
  async update(
    @Param('username') username: string,
    @Body() updateSitterSpecDto: UpdateSitterSpecDto
  ) {
    return this.sitterSpecService.updateSitterSpec(username, updateSitterSpecDto);
  }

  @Delete(':username')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('username') username: string) {
    return this.sitterSpecService.deleteSitterSpec(username);
  }
}
