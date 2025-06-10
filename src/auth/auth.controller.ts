import { Controller, Get, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    
    // You can customize the response or redirect based on your frontend needs
    // Option 1: Return JSON response with user data and token
    return res.status(HttpStatus.OK).json({ user, token });
    
    // Option 2: Redirect to frontend with token in query params
    // return res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
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
}
