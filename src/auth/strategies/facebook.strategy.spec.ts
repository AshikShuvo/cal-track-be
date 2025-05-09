import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { FacebookStrategy } from './facebook.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthProvider, User, UserRole } from '@prisma/client';
import { Profile } from 'passport-facebook';

describe('FacebookStrategy', () => {
  let strategy: FacebookStrategy;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: null,
    name: 'Test User',
    role: UserRole.USER,
    provider: AuthProvider.FACEBOOK,
    providerId: 'facebook-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFacebookProfile = {
    id: 'facebook-123',
    displayName: 'Test User',
    name: {
      givenName: 'Test',
      familyName: 'User',
    },
    emails: [{ value: 'test@example.com' }],
    provider: 'facebook',
  } as Profile;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'FACEBOOK_CLIENT_ID':
          return 'test-client-id';
        case 'FACEBOOK_CLIENT_SECRET':
          return 'test-client-secret';
        case 'FACEBOOK_CALLBACK_URL':
          return 'http://localhost:3000/auth/facebook/callback';
        default:
          return null;
      }
    }),
  };

  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookStrategy,
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

    strategy = module.get<FacebookStrategy>(FacebookStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const accessToken = 'mock-access-token';
    const refreshToken = 'mock-refresh-token';

    it('should create new user if not exists', async () => {
      mockPrismaService.user.upsert.mockResolvedValue(mockUser);

      const result = await strategy.validate(
        accessToken,
        refreshToken,
        mockFacebookProfile,
      );

      expect(result).toEqual(mockUser);
      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { email: mockFacebookProfile.emails![0].value },
        update: {
          providerId: mockFacebookProfile.id,
          provider: 'FACEBOOK',
        },
        create: {
          email: mockFacebookProfile.emails![0].value,
          name: `${mockFacebookProfile.name!.givenName} ${mockFacebookProfile.name!.familyName}`,
          providerId: mockFacebookProfile.id,
          provider: 'FACEBOOK',
          profile: {
            create: {
              activityLevel: 'MODERATE',
            },
          },
        },
      });
    });

    it('should throw UnauthorizedException if email not provided', async () => {
      const profileWithoutEmail: Profile = {
        ...mockFacebookProfile,
        emails: undefined,
      };

      await expect(
        strategy.validate(accessToken, refreshToken, profileWithoutEmail),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.upsert).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if name not provided', async () => {
      const profileWithoutName: Profile = {
        ...mockFacebookProfile,
        name: undefined,
      };

      await expect(
        strategy.validate(accessToken, refreshToken, profileWithoutName),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.upsert).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if database operation fails', async () => {
      mockPrismaService.user.upsert.mockRejectedValue(new Error('Database error'));

      await expect(
        strategy.validate(accessToken, refreshToken, mockFacebookProfile),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.upsert).toHaveBeenCalled();
    });
  });
}); 