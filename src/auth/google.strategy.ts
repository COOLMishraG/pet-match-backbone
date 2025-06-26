import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos, id } = profile;
    
    console.log('🔍 Google Strategy: Processing OAuth profile');
    console.log('📧 Email:', emails[0].value);
    console.log('👤 Name:', name.givenName + ' ' + name.familyName);
    
    // Format the profile data
    const googleProfile = {
      id: id,
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    try {
      // Use the auth service to validate/create the user
      console.log('🔄 Calling AuthService to validate/create OAuth user...');
      const { user, token } = await this.authService.validateOAuthUser(googleProfile);
      
      console.log('✅ Google Strategy: User processed successfully');
      console.log('🎫 Google Strategy: Generated token:', token);
      console.log('👤 Google Strategy: User data:', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email
      }, null, 2));
      
      // Return both user data and token
      const result = {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
        },
        token
      };
      
      console.log('📤 Google Strategy: Returning result to controller');
      done(null, result);
    } catch (error) {
      console.error('❌ Google Strategy: Error during OAuth processing:', error);
      done(error, false);
    }
  }
}
