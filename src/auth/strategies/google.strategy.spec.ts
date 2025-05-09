import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthProvider, User, UserRole } from '@prisma/client';
import { Profile } from 'passport-google-oauth20';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: null,
    name: 'Test User',
    role: UserRole.USER,
    provider: AuthProvider.GOOGLE,
    providerId: 'google-123',
    profileImageUrl: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGoogleProfile = {
    id: 'google-123',
    displayName: 'Test User',
    name: {
      givenName: 'Test',
      familyName: 'User',
    },
    emails: [{ value: 'test@example.com', verified: true }],
    photos: [{ value: 'https://example.com/photo.jpg' }],
    provider: 'google',
  } as Profile;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'GOOGLE_CLIENT_ID':
          return 'test-client-id';
        case 'GOOGLE_CLIENT_SECRET':
          return 'test-client-secret';
        case 'GOOGLE_CALLBACK_URL':
          return 'http://localhost:3000/auth/google/callback';
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
        GoogleStrategy,
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

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
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
        mockGoogleProfile,
      );

      expect(result).toEqual(mockUser);
      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { email: mockGoogleProfile.emails![0].value },
        update: {
          providerId: mockGoogleProfile.id,
          provider: 'GOOGLE',
          profileImageUrl: mockGoogleProfile.photos![0].value,
        },
        create: {
          email: mockGoogleProfile.emails![0].value,
          name: `${mockGoogleProfile.name!.givenName} ${mockGoogleProfile.name!.familyName}`,
          providerId: mockGoogleProfile.id,
          provider: 'GOOGLE',
          profileImageUrl: mockGoogleProfile.photos![0].value,
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
        ...mockGoogleProfile,
        emails: undefined,
      };

      await expect(
        strategy.validate(accessToken, refreshToken, profileWithoutEmail),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.upsert).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if name not provided', async () => {
      const profileWithoutName: Profile = {
        ...mockGoogleProfile,
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
        strategy.validate(accessToken, refreshToken, mockGoogleProfile),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.upsert).toHaveBeenCalled();
    });
  });
}); 