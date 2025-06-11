import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    // Check if email is already in use
    const existingEmail = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Check if username is already in use
    if (userData.username) {
      const existingUsername = await this.usersRepository.findOne({ where: { username: userData.username } });
      if (existingUsername) {
        throw new ConflictException('Username is already taken. Please choose another username.');
      }
    }

    // In your create method, make sure the name field is set
    // If name is not provided, set it from displayName or username
    if (!userData.name) {
      // Try to use displayName first, then username, then email
      userData.name = userData.displayName || userData.username || (userData.email ? userData.email.split('@')[0] : 'User_' + Date.now());
    }
    
    // If username is not provided but displayName is, generate a username
    if (!userData.username && userData.displayName) {
      userData.username = this.generateUsernameFromDisplayName(userData.displayName);
    }
    
    // If displayName is not provided but username is, use username as displayName
    if (!userData.displayName && userData.username) {
      userData.displayName = userData.username;
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Double-check name is set (fail-safe)
    if (!userData.name || userData.name.trim() === '') {
      userData.name = userData.displayName || userData.username || 
        (userData.email ? userData.email.split('@')[0] : 'User_' + Date.now());
        
      console.log('Name was missing, set to:', userData.name);
    }

    const newUser = this.usersRepository.create(userData);
    
    // One more safety check before saving
    if (!newUser.name) {
      newUser.name = newUser.displayName || newUser.username || 
        (newUser.email ? newUser.email.split('@')[0] : 'User_' + Date.now());
      console.log('Final name check - set to:', newUser.name);
    }
    
    return this.usersRepository.save(newUser);
  }

  // Helper method to generate a username from display name
  private generateUsernameFromDisplayName(displayName: string): string {
    // Replace spaces with underscores and make lowercase
    return displayName.replace(/\s+/g, '_').toLowerCase();
  }

  // Get all userssdfkfjsbnfsdnvikbndsikbvuisdghfisdbiuyfcgas78gd8isdhvuidbionvcaOhd87wtdf78asegfikcnsl;cnjsikavcyhxvciasjdp;wjdiuAGYUdvZSncioasjfiopsahuiafdcxusvcjzspckaop;sdjiasgfuisadbcikzsjp;xcjasidguasdgcujsdnjcpolSjcioasgfujasdvbcjkhzb
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // Get user by id
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  // Get user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  // Get user by username
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // Get user by username with proper error handling
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  // Update a user
  async update(id: string, updateData: Partial<User>): Promise<User> {
    // Check if user exists
    await this.findOne(id);

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update the user
    await this.usersRepository.update(id, updateData);
    
    // Return updated user
    return this.findOne(id);
  }

  // Delete a user
  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }
}
