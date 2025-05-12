import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@prisma/client';

export class NutritionTotalsDto {
  @ApiProperty({ description: 'Total calories in kcal' })
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

  @ApiProperty({ description: 'Total sodium in mg' })
  sodium: number;
}

export class NutritionReportDto {
  @ApiProperty({ description: 'Aggregated nutrition totals' })
  totals: NutritionTotalsDto;

  @ApiProperty({ description: 'Food logs grouped by meal type' })
  meals: Record<MealType, any[]>;

  @ApiProperty({ description: 'All food logs in the period' })
  foodLogs: any[];
} 