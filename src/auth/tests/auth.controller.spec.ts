import { Test, TestingModule } from '@nestjs/testing';
import { AuthController, IRequestWithUser } from '../controllers/auth.controller';
import { RegistrationService } from '../services/registration.service';
import { Activity, AuthProvider, Gender, User, UserRole } from '@prisma/client';
import { AuthService, IAuthTokens } from '../services/auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

type MockRequest = {
  user: User;
  session: {
    userId?: string;
  };
};

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
    profileImageUrl: null,
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

  const mockResponse = {
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegistrationService,
          useValue: {
            register: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            handleSocialLogin: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
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
    it('should register a new user successfully', async () => {
      // Mock the service
      jest.spyOn(registrationService, 'register').mockResolvedValue(mockUser);

      // Execute
      const result = await controller.register(mockRegisterDto);

      // Assert
      expect(result).toBe(mockUser);
      expect(registrationService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should handle registration failure', async () => {
      // Mock the service
      jest.spyOn(registrationService, 'register').mockRejectedValue(new Error('Registration failed'));

      // Execute and Assert
      await expect(controller.register(mockRegisterDto)).rejects.toThrow('Registration failed');
      expect(registrationService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('social auth', () => {
    const mockRequest: MockRequest = {
      user: mockUser,
      session: {
        userId: undefined,
      },
    };

    it('should handle Google callback successfully', async () => {
      // Mock the service
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue(mockAuthTokens);

      // Execute
      await controller.googleAuthCallback(mockRequest as unknown as IRequestWithUser, mockResponse);

      // Assert
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(mockUser);
      expect(mockRequest.session.userId).toBe(mockUser.id);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/auth/callback?tokens='),
      );
    });

    it('should handle Facebook callback successfully', async () => {
      // Mock the service
      jest.spyOn(authService, 'handleSocialLogin').mockResolvedValue(mockAuthTokens);

      // Execute
      await controller.facebookAuthCallback(mockRequest as unknown as IRequestWithUser, mockResponse);

      // Assert
      expect(authService.handleSocialLogin).toHaveBeenCalledWith(mockUser);
      expect(mockRequest.session.userId).toBe(mockUser.id);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/auth/callback?tokens='),
      );
    });
  });
}); 