import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { LoginDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/password-reset.dto';
import { PasswordService } from './password.service';
import { UserResponseDto } from '../dto/user-response.dto';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(loginDto: LoginDto): Promise<IAuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async handleSocialLogin(user: User): Promise<IAuthTokens> {
    return this.generateTokens(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    // TODO: Send email with reset token
    // This would typically integrate with an email service
    console.log(`Reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    try {
      const payload = this.jwtService.verify(dto.token);
      const userId = payload.sub;

      if (dto.password !== dto.passwordConfirm) {
        throw new UnauthorizedException('Passwords do not match');
      }

      const hashedPassword = await this.passwordService.hashPassword(dto.password);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  private generateTokens(user: User): IAuthTokens {
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    };
  }
} 