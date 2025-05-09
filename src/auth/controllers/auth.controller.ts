import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationService } from '../services/registration.service';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@prisma/client';

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
  public async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.registrationService.registerUser(registerDto);
  }
} 