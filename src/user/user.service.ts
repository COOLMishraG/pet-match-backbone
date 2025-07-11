import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { SitterSpecService } from '../sitter-spec/sitter-spec.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private sitterSpecService: SitterSpecService,
  ) {}  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    try {
      // Check if email is already in use
      console.log('Service: Creating user with data:', JSON.stringify({
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        name: userData.name
      }, null, 2));
      
      if (!userData.email) {
        console.error('Email is required but not provided');
        throw new Error('Email is required');
      }
      
      const existingEmail = await this.usersRepository.findOne({ where: { email: userData.email } });
      if (existingEmail) {
        console.error(`Email ${userData.email} already exists`);
        throw new ConflictException('User with this email already exists');
      }
      
      // Check if username is already in use
      if (userData.username) {
        const existingUsername = await this.usersRepository.findOne({ where: { username: userData.username } });
        if (existingUsername) {
          console.error(`Username ${userData.username} already exists`);
          throw new ConflictException('Username is already taken. Please choose another username.');
        }
      }
    } catch (error) {
      console.error('Error during initial user validation:', error);
      throw error;
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
    // Note: password can be null for OAuth users

    // Double-check name is set (fail-safe)
    if (!userData.name || userData.name.trim() === '') {
      userData.name = userData.displayName || userData.username || 
        (userData.email ? userData.email.split('@')[0] : 'User_' + Date.now());
        
      console.log('Name was missing, set to:', userData.name);
    }    try {
      const newUser = this.usersRepository.create(userData);
      
      // One more safety check before saving
      if (!newUser.name) {
        newUser.name = newUser.displayName || newUser.username || 
          (newUser.email ? newUser.email.split('@')[0] : 'User_' + Date.now());
        console.log('Final name check - set to:', newUser.name);
      }
      
      console.log('About to save user:', JSON.stringify({
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        displayName: newUser.displayName
      }, null, 2));
      
      // Test database connection before save
      try {
        console.log('🔍 Testing database connection...');
        const connectionTest = await this.usersRepository.query('SELECT 1 as test');
        console.log('✅ Database connection is active:', connectionTest);
      } catch (dbError) {
        console.error('❌ Database connection test failed:', dbError);
        throw new Error('Database connection is not available');
      }
      
      console.log('🔄 Calling usersRepository.save()...');
      
      // Add timeout to detect hanging saves
      const savePromise = this.usersRepository.save(newUser);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database save timeout after 10 seconds')), 10000);
      });
      
      const savedUser = await Promise.race([savePromise, timeoutPromise]) as User;
      
      console.log('✅ User successfully saved to database');
      console.log('📋 Saved user details:', {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role
      });

      // Create sitter spec if user role is SITTER
      if (savedUser.role === UserRole.SITTER) {
        try {
          console.log('🐕 Creating sitter spec for new sitter user:', savedUser.username);
          await this.sitterSpecService.createSitterSpec(savedUser.username);
          console.log('✅ Sitter spec created successfully');
        } catch (sitterError) {
          console.error('❌ Error creating sitter spec:', sitterError);
          // Don't fail user creation if sitter spec fails
          // You might want to handle this differently based on your needs
        }
      }
      
      console.log('🔄 Returning saved user from UserService');
      
      return savedUser;
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR saving user to database!');
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      if (error.code === '23505') { // Unique constraint violation
        console.error('❌ Unique constraint violation - user already exists');
        throw new ConflictException('User with this email or username already exists');
      }
      throw error; // Re-throw other errors
    }
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

  async findAllSitters(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: UserRole.SITTER } });
  }
  // Get all vets
  async findAllVets(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: UserRole.VET } });
  }
  // Update a user
  async update(id: string, updateData: Partial<User>): Promise<User> {
    // Check if user exists and get current user data
    const currentUser = await this.findOne(id);

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Check if role is being changed to SITTER
    const isBecomingSitter = updateData.role === UserRole.SITTER && currentUser.role !== UserRole.SITTER;
    
    // Check if role is being changed from SITTER to something else
    const isLeavingSitter = currentUser.role === UserRole.SITTER && updateData.role && updateData.role !== UserRole.SITTER;

    // Update the user
    await this.usersRepository.update(id, updateData);
    
    // Get updated user
    const updatedUser = await this.findOne(id);

    // Handle sitter spec creation/deletion based on role changes
    if (isBecomingSitter) {
      try {
        console.log('🐕 User converting to sitter, creating sitter spec for:', updatedUser.username);
        await this.sitterSpecService.createSitterSpec(updatedUser.username);
        console.log('✅ Sitter spec created for role conversion');
      } catch (sitterError) {
        console.error('❌ Error creating sitter spec during role conversion:', sitterError);
        // Continue execution, don't fail the user update
      }
    } else if (isLeavingSitter) {
      try {
        console.log('🚫 User leaving sitter role, removing sitter spec for:', updatedUser.username);
        await this.sitterSpecService.deleteSitterSpec(updatedUser.username);
        console.log('✅ Sitter spec removed for role change');
      } catch (sitterError) {
        console.error('❌ Error removing sitter spec during role change:', sitterError);
        // Continue execution, don't fail the user update
      }
    }
    
    return updatedUser;
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
    
    // Check if this is an OAuth user (no password set)
    if (!user.password) {
      throw new UnauthorizedException('This account was created with Google OAuth. Please use Google Sign-In.');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }
    // Check if a user with the given email or username exists
  async checkIfUserExists(email?: string, username?: string): Promise<boolean> {
    if (!email && !username) {
      return false;
    }
    
    try {
      // Use separate queries to check email and username independently
      let emailExists = false;
      let usernameExists = false;

      if (email) {
        try {
          const userWithEmail = await this.usersRepository.findOne({ where: { email } });
          emailExists = !!userWithEmail;
        } catch (err) {
          console.error('Error checking email existence:', err);
          // Continue execution to check username
        }
      }
      
      if (username) {
        try {
          const userWithUsername = await this.usersRepository.findOne({ where: { username } });
          usernameExists = !!userWithUsername;
        } catch (err) {
          console.error('Error checking username existence:', err);
          // If email was already checked, we can still return its result
        }
      }
      
      // Return true if either email or username exists
      return emailExists || usernameExists;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      throw error;
    }
  }

  /**
   * Add notification to user
   */
  async addNotification(username: string, notification: string): Promise<User> {
    const user = await this.findOneByUsername(username);
    
    if (!user.notifications) {
      user.notifications = [];
    }
    
    // Add notification to the beginning of the array (newest first)
    user.notifications.unshift(notification);
    
    // Limit notifications to last 50 to prevent unlimited growth
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(0, 50);
    }
    
    await this.usersRepository.save(user);
    return user;
  }

  /**
   * Remove specific notification from user
   */
  async removeNotification(username: string, notificationIndex: number): Promise<User> {
    const user = await this.findOneByUsername(username);
    
    if (!user.notifications || notificationIndex < 0 || notificationIndex >= user.notifications.length) {
      throw new NotFoundException('Notification not found');
    }
    
    user.notifications.splice(notificationIndex, 1);
    
    await this.usersRepository.save(user);
    return user;
  }

  /**
   * Clear all notifications for user
   */
  async clearAllNotifications(username: string): Promise<User> {
    const user = await this.findOneByUsername(username);
    user.notifications = [];
    
    await this.usersRepository.save(user);
    return user;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(username: string): Promise<string[]> {
    const user = await this.findOneByUsername(username);
    return user.notifications || [];
  }
}
