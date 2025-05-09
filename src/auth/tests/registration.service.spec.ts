import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from '../services/registration.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../services/password.service';
import { ConflictException } from '@nestjs/common';
import { Activity, AuthProvider, Gender, User, UserRole } from '@prisma/client';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prismaService: PrismaService;
  let passwordService: PasswordService;

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
    activityLevel: Activity.MODERATE,
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
              create: jest.fn().mockResolvedValue(mockUser),
            },
            profile: {
              create: jest.fn().mockResolvedValue({
                id: 'profile-uuid',
                userId: mockUser.id,
                height: mockRegisterDto.height,
                weight: mockRegisterDto.weight,
                gender: mockRegisterDto.gender,
                activityLevel: mockRegisterDto.activityLevel,
                birthDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            },
            $transaction: jest.fn().mockImplementation(async (callback) => {
              if (typeof callback === 'function') {
                return callback({
                  user: { create: jest.fn().mockResolvedValue(mockUser) },
                  profile: {
                    create: jest.fn().mockResolvedValue({
                      id: 'profile-uuid',
                      userId: mockUser.id,
                      height: mockRegisterDto.height,
                      weight: mockRegisterDto.weight,
                      gender: mockRegisterDto.gender,
                      activityLevel: mockRegisterDto.activityLevel,
                      birthDate: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    }),
                  },
                });
              }
              return mockUser;
            }),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            validatePassword: jest.fn(),
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      // Mock dependencies
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(passwordService, 'validatePassword').mockReturnValue({ isValid: true, errors: [] });
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashedPassword');

      // Execute
      const result = await service.registerUser(mockRegisterDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(passwordService.validatePassword).toHaveBeenCalledWith(mockRegisterDto.password);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(mockRegisterDto.password);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      // Mock dependencies
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      // Execute & Assert
      await expect(service.registerUser(mockRegisterDto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
    });

    it('should throw error if password validation fails', async () => {
      // Mock dependencies
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(passwordService, 'validatePassword').mockReturnValue({
        isValid: false,
        errors: ['Password is too weak'],
      });

      // Execute & Assert
      await expect(service.registerUser(mockRegisterDto)).rejects.toThrow('Password is too weak');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(passwordService.validatePassword).toHaveBeenCalledWith(mockRegisterDto.password);
    });

    it('should throw error if transaction fails', async () => {
      // Mock dependencies
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(passwordService, 'validatePassword').mockReturnValue({ isValid: true, errors: [] });
      jest.spyOn(passwordService, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(new Error('Transaction failed'));

      // Execute & Assert
      await expect(service.registerUser(mockRegisterDto)).rejects.toThrow('Transaction failed');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(passwordService.validatePassword).toHaveBeenCalledWith(mockRegisterDto.password);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(mockRegisterDto.password);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });
}); 