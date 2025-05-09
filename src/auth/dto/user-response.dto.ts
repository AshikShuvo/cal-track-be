import { ApiProperty } from '@nestjs/swagger';
import { Activity, AuthProvider, Gender, Profile, User, UserRole } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';

export class ProfileResponseDto {
  @ApiProperty({ example: 180 })
  height?: number;

  @ApiProperty({ example: 75 })
  weight?: number;

  @ApiProperty({ example: '1990-01-01' })
  birthDate?: Date;

  @ApiProperty({ enum: Gender })
  gender?: Gender;

  @ApiProperty({ enum: Activity })
  activityLevel: Activity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<ProfileResponseDto>) {
    Object.assign(this, partial);
  }
}

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
    enum: UserRole,
    example: 'USER',
  })
  role: UserRole;

  @ApiProperty({
    description: 'The authentication provider',
    enum: AuthProvider,
    example: 'EMAIL',
  })
  provider: AuthProvider;

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

  @ApiProperty({ type: () => ProfileResponseDto })
  @Type(() => ProfileResponseDto)
  profile?: ProfileResponseDto;

  @Exclude()
  password?: string;

  constructor(user?: User & { profile?: Profile | null }) {
    if (user) {
      Object.assign(this, user);
      if (user.profile) {
        this.profile = new ProfileResponseDto(user.profile);
      }
    }
  }
} 