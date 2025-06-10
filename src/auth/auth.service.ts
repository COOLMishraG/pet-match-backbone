import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateOAuthUser(profile: any): Promise<{ user: User; token: string }> {
    try {
      // Try to find the user by email
      const existingUser = await this.userService.findByEmail(profile.email);

      if (existingUser) {
        // If the user exists but doesn't have a Google ID, update it
        if (!existingUser.googleId) {
          await this.userService.update(existingUser.id, {
            googleId: profile.id,
            profileImage: profile.picture || existingUser.profileImage,
          });
        }

        // Generate token for existing user
        const token = this.generateToken(existingUser);
        return { user: existingUser, token };
      } else {
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
        const newUser = await this.userService.create({
          email: profile.email,
          displayName: profile.name || username, // Fallback to username if name is not provided
          username: username,
          googleId: profile.id,
          profileImage: profile.picture,
          isVerified: true, // Auto-verify users from Google
        });

        // Generate token for new user
        const token = this.generateToken(newUser);
        return { user: newUser, token };
      }
    } catch (error) {
      console.error('Error in validateOAuthUser:', error);
      throw error;
    }
  }

  // Generate JWT token for a user
  generateToken(user: User): string {
    return jwt.sign(
      { sub: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }
}
