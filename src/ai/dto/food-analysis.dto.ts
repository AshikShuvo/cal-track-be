import { ApiProperty } from '@nestjs/swagger';

export class NutritionInfoDto {
  @ApiProperty({ description: 'Calories in kcal' })
  calories: number;

  @ApiProperty({ description: 'Protein in grams' })
  protein: number;

  @ApiProperty({ description: 'Carbohydrates in grams' })
  carbs: number;

  @ApiProperty({ description: 'Fat in grams' })
  fat: number;

  @ApiProperty({ description: 'Fiber in grams' })
  fiber: number;

  @ApiProperty({ description: 'Sugar in grams' })
  sugar: number;

  @ApiProperty({ description: 'Sodium in milligrams' })
  sodium: number;
}

export class FoodAnalysisResultDto {
  @ApiProperty({ description: 'Name of the food item' })
  name: string;

  @ApiProperty({ description: 'Estimated portion size in grams' })
  portion: number;

  @ApiProperty({ description: 'Nutritional information' })
  nutrition: NutritionInfoDto;

  @ApiProperty({ description: 'List of detected ingredients', type: [String] })
  ingredients: string[];
}

export class FoodAnalysisErrorDto {
  @ApiProperty({ description: 'Error code' })
  code: string;

  @ApiProperty({ description: 'Error message' })
  message: string;
} 