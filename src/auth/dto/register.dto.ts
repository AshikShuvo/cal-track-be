import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength, IsDate } from 'class-validator';
import { $Enums } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'The password for the account',
    example: 'StrongP@ss123',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;

  @ApiPropertyOptional({
    description: 'The height of the user in centimeters',
    example: 175,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'The weight of the user in kilograms',
    example: 70,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'The activity level of the user',
    enum: $Enums.Activity,
    example: 'MODERATE',
  })
  @IsEnum($Enums.Activity)
  @IsOptional()
  activity?: $Enums.Activity;

  @ApiPropertyOptional({
    description: 'The gender of the user',
    enum: $Enums.Gender,
    example: 'MALE',
  })
  @IsEnum($Enums.Gender)
  @IsOptional()
  gender?: $Enums.Gender;

  @ApiProperty({
    description: 'User birth date',
    example: '1990-01-01',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({
    description: 'User activity level',
    enum: $Enums.Activity,
    default: $Enums.Activity.MODERATE,
  })
  @IsEnum($Enums.Activity)
  @IsOptional()
  activityLevel?: $Enums.Activity = $Enums.Activity.MODERATE;
} 