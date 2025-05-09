import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
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
    const { id, name, emails } = profile;

    if (!emails?.[0]?.value) {
      throw new UnauthorizedException('Email not provided by Facebook');
    }

    if (!name?.givenName || !name?.familyName) {
      throw new UnauthorizedException('Name not provided by Facebook');
    }

    // Find or create user
    const user = await this.prisma.user.upsert({
      where: {
        email: emails[0].value,
      },
      update: {
        providerId: id,
        provider: 'FACEBOOK',
      },
      create: {
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
        providerId: id,
        provider: 'FACEBOOK',
        profile: {
          create: {
            activityLevel: 'MODERATE',
          },
        },
      },
    });

    return user;
  }
} 