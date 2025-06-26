import { Controller, Get, Req, UseGuards, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Guard redirects to Google
  }

@Get('google/redirect')
@UseGuards(AuthGuard('google'))
googleAuthRedirect(@Req() req, @Res() res: Response) {
  // Get the user data and token from Passport strategy
  const { user, token } = req.user || { user: null, token: null };
  
  // Also add logging to the redirect handler to see the complete flow
  console.log('🔍 Google OAuth Redirect Handler');
  console.log('==================================');
  console.log('📋 Raw req.user:', JSON.stringify(req.user, null, 2));
  console.log('📋 User data:', JSON.stringify(user, null, 2));
  console.log('🎫 Generated token:', token);
  console.log('🌐 Redirect URL being used:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth/callback?token=${token}`);
  console.log('==================================');
  
  if (!user || !token) {
    console.error('❌ Google OAuth failed - missing user or token');
    // Redirect to frontend with error
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/signin?error=authentication_failed`);
  }
  
  console.log('✅ Google OAuth successful - redirecting with token');
  // Redirect to frontend with token in query params
  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth/success?token=${token}`);
}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    // req.user contains the validated JWT payload
    return {
      message: 'This is a protected route',
      user: req.user
    };
  }
  // Validate JWT token endpoint
  @Post('validate-token')
  async validateToken(@Req() req: Request, @Res() res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const token = authHeader.substring(7);
      
      // Verify JWT token
      const decoded = this.jwtService.verify(token);
      
      // Get user from database using the 'sub' field from JWT payload
      const user = await this.userService.findOne(decoded.sub);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          role: user.role,
          phone: user.phone,
          location: user.location,
          displayName: user.displayName
        }
      });
      
    } catch (error) {
      console.error('❌ Token validation error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ valid: false, message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ valid: false, message: 'Token expired' });
      }
      
      return res.status(500).json({ valid: false, message: 'Internal server error' });
    }
  }

// Verify user credentials (login check)
@Post('verify')
async verifyUser(@Body() loginData: { username: string; password: string }) {
  try {
    console.log('🔐 Auth: Verifying user credentials for username:', loginData.username);
      
      // Validate required fields
      if (!loginData.username || !loginData.password) {
        console.error('❌ Auth: Missing username or password');
        return {
          success: false,
          message: 'Username and password are required'
        };
      }

      // Use AuthService to validate credentials
      const result = await this.authService.validateUserByUsername(loginData.username, loginData.password);
      
      if (result.user) {
        console.log('✅ Auth: User verification successful for username:', result.user.username);
        return {
          success: true,
          message: 'User credentials are valid',
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
            displayName: result.user.displayName,
            role: result.user.role
          },
          token: result.token
        };
      } else {
        console.log('❌ Auth: User verification failed for username:', loginData.username);
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
    } catch (error) {
      console.error('❌ Auth: Error during user verification:', error.message);
      return {
        success: false,
        message: 'Authentication failed',
        error: error.message
      };
    }
  }
}
