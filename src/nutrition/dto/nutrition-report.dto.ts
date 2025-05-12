import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@prisma/client';

export class NutritionSummaryDto {
  @ApiProperty({ description: 'Total calories consumed' })
  calories: number;

  @ApiProperty({ description: 'Total protein in grams' })
  protein: number;

  @ApiProperty({ description: 'Total carbohydrates in grams' })
  carbs: number;

  @ApiProperty({ description: 'Total fat in grams' })
  fat: number;

  @ApiProperty({ description: 'Total fiber in grams' })
  fiber: number;

  @ApiProperty({ description: 'Total sugar in grams' })
  sugar: number;

  @ApiProperty({ description: 'Total sodium in milligrams' })
  sodium: number;

  @ApiProperty({ description: 'Percentage of calories from protein' })
  proteinPercentage: number;

  @ApiProperty({ description: 'Percentage of calories from carbs' })
  carbsPercentage: number;

  @ApiProperty({ description: 'Percentage of calories from fat' })
  fatPercentage: number;
}

export class MealSummaryDto {
  @ApiProperty({ description: 'Nutritional summary for this meal' })
  nutrition: NutritionSummaryDto;

  @ApiProperty({ description: 'Number of food items in this meal' })
  itemCount: number;

  @ApiProperty({ description: 'List of food items in this meal' })
  items: Array<{
    id: string;
    name: string;
    portion: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export class NutritionReportDto {
  @ApiProperty({ description: 'Date of the report' })
  date: Date;

  @ApiProperty({ description: 'Overall nutritional summary' })
  totals: NutritionSummaryDto;

  @ApiProperty({ description: 'Breakdown by meal type' })
  meals: Record<MealType, MealSummaryDto>;

  @ApiProperty({ description: 'Comparison with target goals', required: false })
  targetComparison?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  @ApiProperty({ description: 'List of food logs for the period' })
  foodLogs: Array<{
    id: string;
    name: string;
    portion: number;
    mealType: MealType;
    consumedAt: Date;
    nutrition: NutritionSummaryDto;
  }>;
} 