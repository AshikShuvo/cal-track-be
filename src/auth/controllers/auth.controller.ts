import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { RegistrationService } from '../services/registration.service';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { apiResponseDecorator } from '../../common/decorators/api-response.decorator';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthService, IAuthTokens } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Register a new user
   * @param registerDto - The registration data
   * @returns Promise<User> - The created user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user', description: 'Create a new user account with optional profile information' })
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirect to Google login page',
  })
  public async googleAuth(): Promise<void> {
    // Guard will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  @apiResponseDecorator({
    type: AuthTokensDto,
    description: 'Successfully authenticated with Google',
  })
  public async googleAuthCallback(@Req() req: Request): Promise<IAuthTokens> {
    return this.authService.handleSocialLogin(req.user as User);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth2 login' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirect to Facebook login page',
  })
  public async facebookAuth(): Promise<void> {
    // Guard will redirect to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Handle Facebook OAuth2 callback' })
  @apiResponseDecorator({
    type: AuthTokensDto,
    description: 'Successfully authenticated with Facebook',
  })
  public async facebookAuthCallback(@Req() req: Request): Promise<IAuthTokens> {
    return this.authService.handleSocialLogin(req.user as User);
  }
} 