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
  public async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.registrationService.registerUser(registerDto);
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
} 