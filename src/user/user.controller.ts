import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Request,
  Query,
  ConflictException
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateNotificationDto } from './dto/notification.dto';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}  // User registration with token response
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: Partial<User>, @Res() response: Response) {
    try {
      console.log('Controller: Creating user with data:', JSON.stringify(createUserDto, null, 2));
      
      // Validate required fields
      if (!createUserDto.email) {
        console.error('Missing required email in user creation');
        return response.status(HttpStatus.BAD_REQUEST).json({
          message: 'Email is required'
        });
      }
      
      // Password is only required for non-OAuth users
      if (!createUserDto.password && !createUserDto.googleId) {
        console.error('Missing password for non-OAuth user creation');
        return response.status(HttpStatus.BAD_REQUEST).json({
          message: 'Password is required for regular user registration'
        });
      }
      
      const user = await this.userService.create(createUserDto);
      console.log('Controller: User created successfully:', JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username
      }, null, 2));

      // Generate JWT token with user ID for client storage
      const token = jwt.sign(
        { sub: user.id, username: user.username }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      // Return both user and token
      return response.status(HttpStatus.CREATED).json({
        user: user,
        token
      });
    } catch (error) {
      console.error('Error creating user:', error.message, error.stack);
      
      if (error instanceof ConflictException) {
        return response.status(HttpStatus.CONFLICT).json({
          message: error.message
        });
      }
      
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  // User login endpoint
  @Post('login')
  async login(@Body() loginData: { email: string; password: string }, @Res() response: Response) {    const user = await this.userService.validateUser(loginData.email, loginData.password);
    
    const token = jwt.sign(
      { sub: user.id, username: user.username }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    return response.status(HttpStatus.OK).json({ user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email
    }, token });
  }

  //checked
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Check if user exists by email or username
  @Get('exists')
  async checkIfUserExists(
    @Query('email') email?: string, 
    @Query('username') username?: string
  ) {
    try {
      // Validation - at least one parameter should be provided
      if (!email && !username) {
        return { 
          exists: false, 
          message: 'At least one query parameter (email or username) is required'
        };
      }
      
      const exists = await this.userService.checkIfUserExists(email, username);
      
      return { 
        exists, 
        email: email || undefined,
        username: username || undefined
      };
    } catch (error) {
      console.error('Error in checkIfUserExists controller:', error);
      return { 
        exists: false, 
        error: 'An error occurred while checking user existence',
        message: error.message 
      };
    }
  }

  // Get user by username
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    try {
      console.log('🔍 Finding user by username:', username);
      const user = await this.userService.findOneByUsername(username);
      console.log('✅ User found by username:', user.email);
      
      // Return the whole user object (password will be excluded automatically)
      return user;
    } catch (error) {
      console.error('❌ Error finding user by username:', error.message);
      throw error;
    }
  }

  //Retrieving all the vets
  @Get('vets')
  findAllVets(): Promise<User[]> {
    return this.userService.findAllVets();
  }
  @Get('sitters')
  findAllSitters(): Promise<User[]> {
    return this.userService.findAllSitters();
  }
  //checked
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  //checked
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<User>) {
    return this.userService.update(id, updateUserDto);
  }

  // Update user by username
  @Patch('username/:username')
  async updateByUsername(@Param('username') username: string, @Body() updateUserDto: Partial<User>) {
    try {
      console.log('🔄 Updating user by username:', username);
      console.log('📝 Update data:', JSON.stringify(updateUserDto, null, 2));
      
      // First find the user by username to get their ID
      const user = await this.userService.findOneByUsername(username);
      
      // Then update using the ID
      const updatedUser = await this.userService.update(user.id, updateUserDto);
      
      console.log('✅ User updated successfully by username:', updatedUser.email);
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user by username:', error.message);
      throw error;
    }
  }
  //checked
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Notification management endpoints

  /**
   * Get all notifications for a user
   */
  @Get('notifications/:username')
  async getUserNotifications(@Param('username') username: string) {
    try {
      const notifications = await this.userService.getUserNotifications(username);
      return {
        username,
        notifications,
        count: notifications.length
      };
    } catch (error) {
      console.error('Error getting user notifications:', error.message);
      throw error;
    }
  }

  /**
   * Add a notification to a user
   */
  @Post('notifications/:username')
  @HttpCode(HttpStatus.CREATED)
  async addNotification(
    @Param('username') username: string,
    @Body() notificationData: CreateNotificationDto,
    @Res() response: Response
  ) {
    try {
      if (!notificationData.message) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          message: 'Notification message is required'
        });
      }

      const updatedUser = await this.userService.addNotification(username, notificationData.message);
      
      return response.status(HttpStatus.CREATED).json({
        message: 'Notification added successfully',
        username: updatedUser.username,
        notificationCount: updatedUser.notifications?.length || 0
      });
    } catch (error) {
      console.error('Error adding notification:', error.message);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to add notification',
        error: error.message
      });
    }
  }

  /**
   * Remove a specific notification by index
   */
  @Delete('notifications/:username/:index')
  @HttpCode(HttpStatus.OK)
  async removeNotification(
    @Param('username') username: string,
    @Param('index') index: string,
    @Res() response: Response
  ) {
    try {
      const notificationIndex = parseInt(index, 10);
      
      if (isNaN(notificationIndex)) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid notification index'
        });
      }

      const updatedUser = await this.userService.removeNotification(username, notificationIndex);
      
      return response.status(HttpStatus.OK).json({
        message: 'Notification removed successfully',
        username: updatedUser.username,
        notificationCount: updatedUser.notifications?.length || 0
      });
    } catch (error) {
      console.error('Error removing notification:', error.message);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to remove notification',
        error: error.message
      });
    }
  }

  /**
   * Clear all notifications for a user
   */
  @Delete('notifications/:username')
  @HttpCode(HttpStatus.OK)
  async clearAllNotifications(@Param('username') username: string) {
    try {
      const updatedUser = await this.userService.clearAllNotifications(username);
      
      return {
        message: 'All notifications cleared successfully',
        username: updatedUser.username,
        notificationCount: 0
      };
    } catch (error) {
      console.error('Error clearing notifications:', error.message);
      throw error;
    }
  }
}
