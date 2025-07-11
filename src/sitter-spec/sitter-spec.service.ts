import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitterSpec } from './sitter-spec.entity';

@Injectable()
export class SitterSpecService {
  constructor(
    @InjectRepository(SitterSpec)
    private sitterSpecRepository: Repository<SitterSpec>,
  ) {}

  /**
   * Create a new sitter spec entry
   */
  async createSitterSpec(userName: string): Promise<SitterSpec> {
    try {
      console.log('Creating sitter spec for username:', userName);
      
      // Check if sitter spec already exists for this username
      const existingSitterSpec = await this.sitterSpecRepository.findOne({
        where: { userName }
      });
      
      if (existingSitterSpec) {
        console.log('Sitter spec already exists for username:', userName);
        return existingSitterSpec;
      }

      // Create new sitter spec with default values
      const newSitterSpec = this.sitterSpecRepository.create({
        userName,
        price: 0,
        rating: 0,
        available: true,
        description: '',
        specialties: [],
        petSatCount: 0,
        experience: 0,
        responseTime: 'Within 24 hours'
      });

      const savedSitterSpec = await this.sitterSpecRepository.save(newSitterSpec);
      console.log('Successfully created sitter spec:', savedSitterSpec.id);
      
      return savedSitterSpec;
    } catch (error) {
      console.error('Error creating sitter spec:', error);
      throw error;
    }
  }

  /**
   * Find sitter spec by username
   */
  async findByUsername(userName: string): Promise<SitterSpec> {
    const sitterSpec = await this.sitterSpecRepository.findOne({
      where: { userName }
    });
    
    if (!sitterSpec) {
      throw new NotFoundException(`Sitter spec not found for username: ${userName}`);
    }
    
    return sitterSpec;
  }

  /**
   * Update sitter spec
   */
  async updateSitterSpec(userName: string, updateData: Partial<SitterSpec>): Promise<SitterSpec> {
    const sitterSpec = await this.findByUsername(userName);
    
    Object.assign(sitterSpec, updateData);
    
    return await this.sitterSpecRepository.save(sitterSpec);
  }

  /**
   * Get all sitter specs
   */
  async findAll(): Promise<SitterSpec[]> {
    return await this.sitterSpecRepository.find();
  }

  /**
   * Delete sitter spec (when user changes role from sitter)
   */
  async deleteSitterSpec(userName: string): Promise<void> {
    const result = await this.sitterSpecRepository.delete({ userName });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Sitter spec not found for username: ${userName}`);
    }
  }
}
