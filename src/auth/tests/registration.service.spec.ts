import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from '../services/registration.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../services/password.service';
import { ConflictException } from '@nestjs/common';
import { Activity, AuthProvider, Gender, User, UserRole } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prismaService: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let passwordService: jest.Mocked<PasswordService>;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: UserRole.USER,
    provider: AuthProvider.EMAIL,
    providerId: null,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegisterDto = {
    email: 'test@example.com',
    password: 'StrongP@ssw0rd',
    name: 'Test User',
    height: 180,
    weight: 75,
    gender: Gender.MALE,
    activityLevel: Activity.MODERATE,
    birthDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    prismaService = module.get(PrismaService);
    passwordService = module.get(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock dependencies
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({ ...mockUser, profile: null });
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      passwordService.validatePassword.mockReturnValue({ isValid: true, errors: [] });

      // Execute
      const result = await service.register(mockRegisterDto);

      // Assert
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: mockRegisterDto.email,
          password: 'hashedPassword',
        }),
        include: { profile: true },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      // Mock dependencies
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Execute and Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw error if password is weak', async () => {
      // Mock dependencies
      prismaService.user.findUnique.mockResolvedValue(null);
      passwordService.validatePassword.mockReturnValue({ isValid: false, errors: ['Password is too weak'] });

      // Execute and Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow('Password is too weak');
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should handle database transaction failure', async () => {
      // Mock dependencies
      prismaService.user.findUnique.mockResolvedValue(null);
      passwordService.validatePassword.mockReturnValue({ isValid: true, errors: [] });
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      prismaService.user.create.mockRejectedValue(new Error('Transaction failed'));

      // Execute and Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow('Transaction failed');
    });
  });
}); 