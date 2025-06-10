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
  Request
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // User registration with token response
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: Partial<User>, @Res() response: Response) {
    const user = await this.userService.create(createUserDto);
    
    // Generate JWT token with user ID for client storage
    const token = jwt.sign(
      { sub: user.id, username: user.username }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return both user and token
    return response.status(HttpStatus.CREATED).json({
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        // Include other non-sensitive fields
      },
      token
    });
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

  //checked
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
