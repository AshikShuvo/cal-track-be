import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthProvider, User, UserRole } from '@prisma/client';
import { Role } from '../../common/enums/role.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test User',
    role: Role.USER,
    provider: AuthProvider.EMAIL,
    providerId: null,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if valid payload', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: mockUser.id, email: mockUser.email });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate({ sub: 'invalid-id', email: 'invalid@example.com' }))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
}); 