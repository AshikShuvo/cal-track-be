import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RegistrationService } from '../services/registration.service';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { apiResponseDecorator } from '../../common/decorators/api-response.decorator';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Session } from 'express-session';
import { LoginDto } from '../dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/password-reset.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

export interface IRequestWithUser extends Request {
  user: User;
  session: Session & { userId?: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user with optional profile information
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with optional profile information. The password must meet security requirements.',
  })
  @apiResponseDecorator({
    type: UserResponseDto,
    status: HttpStatus.CREATED,
    description: 'User has been successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or password requirements not met',
  })
  public async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.registrationService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: IRequestWithUser): Promise<void> {
    req.session.destroy((err) => {
      if (err) {
        throw new Error('Failed to destroy session');
      }
    });
  }

  @Post('password-reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<void> {
    await this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto);
  }

  /**
   * Initiate Google OAuth2 authentication
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Initiate Google OAuth2 login',
    description: 'Redirects the user to Google\'s authentication page',
  })
  public async googleAuth(): Promise<void> {
    // Guard redirects to Google
  }

  /**
   * Handle Google OAuth2 callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Handle Google OAuth2 callback',
    description: 'Processes the authentication response from Google',
  })
  public async googleAuthCallback(
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.handleSocialLogin(req.user);
    req.session.userId = req.user.id;
    
    const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:3000');
    res.redirect(`${clientUrl}/auth/callback?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
  }

  /**
   * Initiate Facebook OAuth2 authentication
   */
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({
    summary: 'Initiate Facebook OAuth2 login',
    description: 'Redirects the user to Facebook\'s authentication page',
  })
  public async facebookAuth(): Promise<void> {
    // Guard redirects to Facebook
  }

  /**
   * Handle Facebook OAuth2 callback
   */
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({
    summary: 'Handle Facebook OAuth2 callback',
    description: 'Processes the authentication response from Facebook',
  })
  public async facebookAuthCallback(
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.handleSocialLogin(req.user);
    req.session.userId = req.user.id;
    
    const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:3000');
    res.redirect(`${clientUrl}/auth/callback?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
  }

  @Get('session')
  @ApiOperation({
    summary: 'Get current session information',
    description: 'Returns information about the current session',
  })
  public getSession(@Req() req: IRequestWithUser): { userId: string | undefined } {
    return { userId: req.session.userId };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @apiResponseDecorator({ 
    type: UserResponseDto,
    status: HttpStatus.OK,
    description: 'Current user profile retrieved successfully'
  })
  async getCurrentUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(user.id);
  }
} 