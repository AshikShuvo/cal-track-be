import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    try {
      if (!profile.emails?.[0]?.value) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      if (!profile.name?.givenName || !profile.name?.familyName) {
        throw new UnauthorizedException('Name not provided by Google');
      }

      // Find or create user
      const user = await this.prisma.user.upsert({
        where: {
          email: profile.emails[0].value,
        },
        update: {
          providerId: profile.id,
          provider: 'GOOGLE',
        },
        create: {
          email: profile.emails[0].value,
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          providerId: profile.id,
          provider: 'GOOGLE',
          profile: {
            create: {
              activityLevel: 'MODERATE',
            },
          },
        },
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to validate Google profile: ${error.message}`);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }
} 