import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: $Enums.UserRole,
    example: 'USER',
  })
  role: $Enums.UserRole;

  @ApiProperty({
    description: 'The authentication provider',
    enum: $Enums.AuthProvider,
    example: 'EMAIL',
  })
  provider: $Enums.AuthProvider;

  @ApiProperty({
    description: 'The provider-specific ID (for social auth)',
    example: null,
    required: false,
    nullable: true,
  })
  providerId: string | null;

  @ApiProperty({
    description: 'The timestamp when the user was created',
    example: '2024-03-15T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the user was last updated',
    example: '2024-03-15T12:00:00.000Z',
  })
  updatedAt: Date;
} 