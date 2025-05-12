import { ApiProperty } from '@nestjs/swagger';

export class FoodAnalysisResultDto {
  @ApiProperty({ description: 'Name of the detected food' })
  name: string;

  @ApiProperty({ description: 'List of ingredients detected' })
  ingredients: string[];

  @ApiProperty({ description: 'Nutritional information' })
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export class FoodAnalysisErrorDto {
  @ApiProperty({ description: 'Error code' })
  code: string;

  @ApiProperty({ description: 'Error message' })
  message: string;
} 