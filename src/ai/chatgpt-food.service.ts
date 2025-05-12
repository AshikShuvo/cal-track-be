import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from './dto/food-analysis.dto';

@Injectable()
export class ChatGptFoodService {
  private readonly logger = new Logger(ChatGptFoodService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async analyzeFoodImage(imageBuffer: Buffer): Promise<FoodAnalysisResultDto | FoodAnalysisErrorDto> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a food analysis expert. Analyze the food image and provide detailed nutritional information including ingredients list. Return the response in a structured JSON format.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide: 1) Food name 2) Estimated portion size in grams 3) List of ingredients 4) Nutritional values (calories, protein, carbs, fat, fiber, sugar, sodium)',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      const analysisResult: FoodAnalysisResultDto = {
        name: analysis.name,
        portion: analysis.portion || 0,
        ingredients: analysis.ingredients || [],
        nutrition: {
          calories: analysis.nutrition?.calories || 0,
          protein: analysis.nutrition?.protein || 0,
          carbs: analysis.nutrition?.carbs || 0,
          fat: analysis.nutrition?.fat || 0,
          fiber: analysis.nutrition?.fiber || 0,
          sugar: analysis.nutrition?.sugar || 0,
          sodium: analysis.nutrition?.sodium || 0,
        },
      };
      return analysisResult;
    } catch (error) {
      this.logger.error('Error analyzing food image:', error);
      const errorResponse: FoodAnalysisErrorDto = {
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze food image',
      };
      return errorResponse;
    }
  }
} 