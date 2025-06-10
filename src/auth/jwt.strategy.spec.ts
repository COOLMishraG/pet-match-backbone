import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: UserService;

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 'test-id',
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@example.com',
    googleId: undefined,
    profileImage: undefined,
    isVerified: true,
  };

  const mockPayload = {
    sub: 'test-id',
    username: 'testuser',
    iat: 1234567890,
    exp: 9876543210,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    process.env.JWT_SECRET = 'test-secret';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data when validation succeeds', async () => {
      // Arrange
      mockUserService.findOne.mockResolvedValue(mockUser);
      
      // Act
      const result = await strategy.validate(mockPayload);
      
      // Assert
      expect(userService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        displayName: mockUser.displayName,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockUserService.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    });
  });
});
