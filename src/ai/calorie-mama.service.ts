import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from './dto/food-analysis.dto';

@Injectable()
export class CalorieMamaService {
  private readonly logger = new Logger(CalorieMamaService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://dev.caloriemama.ai/api/food-recognition';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CALORIE_MAMA_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('CalorieMama API key not found in environment variables');
    }
  }

  async analyzeFoodImage(imageBuffer: Buffer): Promise<FoodAnalysisResultDto | FoodAnalysisErrorDto> {
    try {
      if (!this.apiKey) {
        throw new Error('CalorieMama API key not configured');
      }

      const formData = new FormData();
      formData.append('image', new Blob([imageBuffer]), 'food.jpg');

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data || !response.data.food) {
        const errorResponse: FoodAnalysisErrorDto = {
          code: 'NO_FOOD_DETECTED',
          message: 'No food was detected in the image',
        };
        return errorResponse;
      }

      const foodData = response.data.food;
      const analysisResult: FoodAnalysisResultDto = {
        name: foodData.name,
        portion: foodData.portion || 0,
        ingredients: foodData.ingredients || [],
        nutrition: {
          calories: foodData.calories || 0,
          protein: foodData.protein || 0,
          carbs: foodData.carbs || 0,
          fat: foodData.fat || 0,
          fiber: foodData.fiber || 0,
          sugar: foodData.sugar || 0,
          sodium: foodData.sodium || 0,
        },
      };
      return analysisResult;
    } catch (error) {
      this.logger.error('Error analyzing food image:', error);
      
      if (axios.isAxiosError(error)) {
        const apiError: FoodAnalysisErrorDto = {
          code: 'API_ERROR',
          message: error.response?.data?.message || 'Error analyzing food image',
        };
        return apiError;
      }

      const unknownError: FoodAnalysisErrorDto = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
      return unknownError;
    }
  }
} 