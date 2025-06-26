import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateOAuthUser(profile: any): Promise<{ user: User; token: string }> {
    try {
      console.log('🔍 AuthService: Starting OAuth user validation');
      console.log('📧 Profile email:', profile.email);
      
      // Try to find the user by email
      const existingUser = await this.userService.findByEmail(profile.email);

      if (existingUser) {
        console.log('👤 Found existing user:', existingUser.email);
        // If the user exists but doesn't have a Google ID, update it
        if (!existingUser.googleId) {
          console.log('🔄 Updating existing user with Google ID');
          await this.userService.update(existingUser.id, {
            googleId: profile.id,
            profileImage: profile.picture || existingUser.profileImage,
          });
        }

        // Generate token for existing user
        console.log('🎫 Generating token for existing user...');
        const token = this.generateToken(existingUser);
        console.log('🎫 AuthService: Generated token for existing OAuth user:', token);
        return { user: existingUser, token };
      } else {
        console.log('👤 No existing user found, creating new user...');
        // Generate a unique username based on email
        const emailPrefix = profile.email.split('@')[0];
        let username = emailPrefix;
        let counter = 1;
        
        // Check if username exists and add counter if needed
        let usernameExists = await this.userService.findByUsername(username);
        while (usernameExists) {
          username = `${emailPrefix}${counter}`;
          counter++;
          usernameExists = await this.userService.findByUsername(username);
        }        // Create a new user with Google profile data
        console.log('🔄 About to create new user with data:', {
          email: profile.email,
          name: profile.name || username,
          username: username,
          googleId: profile.id
        });
        
        const newUser = await this.userService.create({
          email: profile.email,
          name: profile.name || username, // Set the required 'name' field
          displayName: profile.name || username, // Fallback to username if name is not provided
          username: username,
          googleId: profile.id,
          profileImage: profile.picture,
          isVerified: true, // Auto-verify users from Google
          // password is nullable, so we don't need to provide it for OAuth users
        });

        console.log('✅ New OAuth user created successfully!');
        console.log('📋 Checking returned user object...');
        
        if (!newUser) {
          throw new Error('User creation returned null/undefined');
        }
        
        if (!newUser.id) {
          throw new Error('User creation returned user without ID');
        }
        
        console.log('📋 Created user details:', {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          hasId: !!newUser.id,
          hasEmail: !!newUser.email,
          hasUsername: !!newUser.username
        });
        console.log('🎫 About to generate token for new user...');
        
        // Generate token for new user
        try {
          const token = this.generateToken(newUser);
          console.log('🎫 AuthService: Generated token for new OAuth user:', token);
          console.log('✅ Returning user and token from AuthService');
          return { user: newUser, token };
        } catch (tokenError) {
          console.error('❌ Token generation failed:', tokenError);
          throw tokenError;
        }
      }
    } catch (error) {
      console.error('❌ Critical error in validateOAuthUser:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Generate JWT token for a user
  generateToken(user: User): string {
    try {
      console.log('🎫 Generating token for user:', user.id, user.username);
      const payload = { sub: user.id, username: user.username };
      console.log('📝 JWT payload:', payload);
      
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      console.log('✅ Token generated successfully, length:', token.length);
      return token;
    } catch (error) {
      console.error('❌ Error generating token:', error);
      throw error;
    }
  }

  // Validate user credentials for regular login
  async validateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      console.log('🔐 AuthService: Validating user credentials for:', email);
      
      // Use UserService to validate credentials
      const user = await this.userService.validateUser(email, password);
      
      // Generate token for authenticated user
      const token = this.generateToken(user);
      
      console.log('✅ AuthService: User validation successful');
      return { user, token };
    } catch (error) {
      console.error('❌ AuthService: User validation failed:', error.message);
      throw error;
    }
  }

  // Validate user credentials by username for regular login
  async validateUserByUsername(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      console.log('🔐 AuthService: Validating user credentials for username:', username);
      
      // First find the user by username
      const user = await this.userService.findOneByUsername(username);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Then validate the password using email (since validateUser expects email)
      const validatedUser = await this.userService.validateUser(user.email, password);
      
      // Generate token for authenticated user
      const token = this.generateToken(validatedUser);
      
      console.log('✅ AuthService: Username validation successful');
      return { user: validatedUser, token };
    } catch (error) {
      console.error('❌ AuthService: Username validation failed:', error.message);
      throw error;
    }
  }
}
