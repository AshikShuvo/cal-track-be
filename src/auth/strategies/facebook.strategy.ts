import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3000/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    try {
      if (!profile.emails?.[0]?.value) {
        throw new UnauthorizedException('Email not provided by Facebook');
      }

      if (!profile.name?.givenName || !profile.name?.familyName) {
        throw new UnauthorizedException('Name not provided by Facebook');
      }

      // Find or create user
      const user = await this.prisma.user.upsert({
        where: {
          email: profile.emails[0].value,
        },
        update: {
          providerId: profile.id,
          provider: 'FACEBOOK',
        },
        create: {
          email: profile.emails[0].value,
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          providerId: profile.id,
          provider: 'FACEBOOK',
          profile: {
            create: {
              activityLevel: 'MODERATE',
            },
          },
        },
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to validate Facebook profile: ${error.message}`);
      throw new UnauthorizedException('Failed to authenticate with Facebook');
    }
  }
} 