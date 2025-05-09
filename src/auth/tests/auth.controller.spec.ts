import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { RegistrationService } from '../services/registration.service';
import { Activity, AuthProvider, Gender, User, UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let registrationService: RegistrationService;

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
      controllers: [AuthController],
      providers: [
        {
          provide: RegistrationService,
          useValue: {
            registerUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registrationService = module.get<RegistrationService>(RegistrationService);
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
}); 