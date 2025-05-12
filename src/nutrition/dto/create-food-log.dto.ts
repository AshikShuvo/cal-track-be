import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsDate, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from '@prisma/client';

export class CreateNutritionInfoDto {
  @ApiProperty({ description: 'Calories in kcal' })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({ description: 'Protein in grams', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  protein?: number;

  @ApiProperty({ description: 'Carbohydrates in grams', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  carbs?: number;

  @ApiProperty({ description: 'Fat in grams', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fat?: number;

  @ApiProperty({ description: 'Fiber in grams', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fiber?: number;

  @ApiProperty({ description: 'Sugar in grams', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sugar?: number;

  @ApiProperty({ description: 'Sodium in mg', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sodium?: number;
}

export class CreateFoodLogDto {
  @ApiProperty({ description: 'Name of the food item' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Portion size in grams/ml' })
  @IsNumber()
  @Min(0)
  portion: number;

  @ApiProperty({ description: 'Type of meal', enum: MealType })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({ description: 'When the food was consumed' })
  @IsDate()
  @Type(() => Date)
  consumedAt: Date;

  @ApiProperty({ description: 'Nutritional information', type: CreateNutritionInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateNutritionInfoDto)
  nutrition?: CreateNutritionInfoDto;
} 