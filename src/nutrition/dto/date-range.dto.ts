import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({
    description: 'Start date for the nutrition report',
    example: '2024-03-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for the nutrition report',
    example: '2024-03-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Timezone for date calculations',
    example: 'UTC',
    required: false,
  })
  @IsString()
  @IsOptional()
  timezone?: string;
} 