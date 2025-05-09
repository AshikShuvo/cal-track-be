import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
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
    const { id, name, emails } = profile;

    if (!emails?.[0]?.value) {
      throw new UnauthorizedException('Email not provided by Google');
    }

    if (!name?.givenName || !name?.familyName) {
      throw new UnauthorizedException('Name not provided by Google');
    }

    // Find or create user
    const user = await this.prisma.user.upsert({
      where: {
        email: emails[0].value,
      },
      update: {
        providerId: id,
        provider: 'GOOGLE',
      },
      create: {
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
        providerId: id,
        provider: 'GOOGLE',
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