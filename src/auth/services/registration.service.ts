import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { RegisterDto } from '../dto/register.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthProvider } from '.prisma/client';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Registers a new user with their profile
   * @param registerDto - The registration data
   * @returns Promise<UserResponseDto> - The created user response
   * @throws ConflictException if email already exists
   */
  public async register(dto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate password
    const validation = this.passwordService.validatePassword(dto.password);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const hashedPassword = await this.passwordService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        provider: AuthProvider.EMAIL,
        profile: {
          create: {
            height: dto.height,
            weight: dto.weight,
            birthDate: dto.birthDate,
            gender: dto.gender,
            activityLevel: dto.activityLevel,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return new UserResponseDto(user);
  }
} 