import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationService } from '../services/registration.service';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { apiResponseDecorator } from '../../common/decorators/api-response.decorator';
import { UserResponseDto } from '../dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly registrationService: RegistrationService) {}

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
} 