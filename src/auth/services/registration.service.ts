import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@prisma/client';

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
   * @returns Promise<User> - The created user
   * @throws ConflictException if email already exists
   */
  public async registerUser(registerDto: RegisterDto): Promise<User> {
    const { password, height, weight, gender, activityLevel, ...userData } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration attempted with existing email: ${userData.email}`);
      throw new ConflictException('Email already exists');
    }

    try {
      // Validate password
      const passwordValidation = this.passwordService.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(password);

      // Create user and profile in a transaction
      const user = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: 'USER', // Default role
            provider: 'EMAIL', // Default provider
          },
        });

        // Create user profile
        await prisma.profile.create({
          data: {
            userId: newUser.id,
            height,
            weight,
            gender,
            activityLevel,
          },
        });

        return newUser;
      });

      this.logger.log(`User registered successfully: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to register user: ${error.message}`);
      throw error;
    }
  }
} 