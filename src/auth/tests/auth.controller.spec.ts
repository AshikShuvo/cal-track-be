import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { RegistrationService } from '../services/registration.service';
import { Activity, AuthProvider, Gender, User, UserRole } from '@prisma/client';
import { AuthService, IAuthTokens } from '../services/auth.service';
import { Request } from 'express';

interface IRequestWithUser extends Request {
  user: User;
}

describe('AuthController', () => {
  let controller: AuthController;
  let registrationService: RegistrationService;
  let authService: AuthService;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'John Doe',
    role: UserRole.USER,
    provider: AuthProvider.EMAIL,
    providerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegisterDto = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'John Doe',
    height: 175,
    weight: 70,
    gender: Gender.MALE,
    activity: Activity.MODERATE,
  };

  const mockAuthTokens: IAuthTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegistrationService,
          useValue: {
            registerUser: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            handleSocialLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registrationService = module.get<RegistrationService>(RegistrationService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Mock the service
      jest.spyOn(registrationService, 'registerUser').mockResolvedValue(mockUser);

      // Execute
      const result = await controller.register(mockRegisterDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(registrationService.registerUser).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw error if registration fails', async () => {
      // Mock the service
      jest.spyOn(registrationService, 'registerUser').mockRejectedValue(new Error('Registration failed'));

      // Execute & Assert
      await expect(controller.register(mockRegisterDto)).rejects.toThrow('Registration failed');
      expect(registrationService.registerUser).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('social auth', () => {
    const mockRequest = {
      user: mockUser,
    } as IRequestWithUser;

    it('should handle Google callback successfully', async () => {
      // Mock the service
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue(mockAuthTokens);

      // Execute
      const result = await controller.googleAuthCallback(mockRequest);

      // Assert
      expect(result).toEqual(mockAuthTokens);
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(mockUser);
    });

    it('should handle Facebook callback successfully', async () => {
      // Mock the service
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue(mockAuthTokens);

      // Execute
      const result = await controller.facebookAuthCallback(mockRequest);

      // Assert
      expect(result).toEqual(mockAuthTokens);
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(mockUser);
    });
  });
}); 