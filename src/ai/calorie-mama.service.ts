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
        return {
          code: 'NO_FOOD_DETECTED',
          message: 'No food was detected in the image',
        };
      }

      const foodData = response.data.food;
      return {
        name: foodData.name,
        ingredients: foodData.ingredients || [],
        nutrition: {
          calories: foodData.calories || 0,
          protein: foodData.protein || 0,
          carbs: foodData.carbs || 0,
          fat: foodData.fat || 0,
        },
      };
    } catch (error) {
      this.logger.error('Error analyzing food image:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          code: 'API_ERROR',
          message: error.response?.data?.message || 'Error analyzing food image',
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  }
} 