import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { IJwtPayload } from '../strategies/jwt.strategy';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate JWT tokens for a user
   * @param user - The user to generate tokens for
   * @returns IAuthTokens - Access and refresh tokens
   */
  public async generateTokens(user: User): Promise<IAuthTokens> {
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Handle successful social authentication
   * @param user - The authenticated user
   * @returns IAuthTokens - Access and refresh tokens
   */
  public async handleSocialLogin(user: User): Promise<IAuthTokens> {
    this.logger.log(`Social login successful for user: ${user.email}`);
    return this.generateTokens(user);
  }
} 