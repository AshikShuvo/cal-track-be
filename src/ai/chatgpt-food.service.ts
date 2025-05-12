import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from './dto/food-analysis.dto';

@Injectable()
export class ChatGptFoodService {
  private readonly logger = new Logger(ChatGptFoodService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not found in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeFoodImage(imageBuffer: Buffer): Promise<FoodAnalysisResultDto | FoodAnalysisErrorDto> {
    try {
      if (!this.configService.get<string>('OPENAI_API_KEY')) {
        throw new Error('OpenAI API key not configured');
      }

      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and provide the following information in raw JSON format (no markdown formatting, no code blocks): name of the food, list of main ingredients, and nutritional values (calories, protein, carbs, fat). Only respond with valid JSON matching this structure: { name: string, ingredients: string[], nutrition: { calories: number, protein: number, carbs: number, fat: number } }"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return {
          code: 'NO_ANALYSIS',
          message: 'Could not analyze the image',
        };
      }

      this.logger.debug('Raw ChatGPT response:', content);

      try {
        // Clean the response by removing any markdown formatting
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        this.logger.debug('Cleaned content:', cleanedContent);
        const analysis = JSON.parse(cleanedContent);
        
        // Validate the response structure
        if (!analysis.name || !Array.isArray(analysis.ingredients) || !analysis.nutrition) {
          return {
            code: 'INVALID_RESPONSE',
            message: 'Invalid analysis response structure',
          };
        }

        return {
          name: analysis.name,
          ingredients: analysis.ingredients,
          nutrition: {
            calories: analysis.nutrition.calories || 0,
            protein: analysis.nutrition.protein || 0,
            carbs: analysis.nutrition.carbs || 0,
            fat: analysis.nutrition.fat || 0,
          },
        };
      } catch (parseError) {
        this.logger.error('Error parsing ChatGPT response:', parseError);
        return {
          code: 'PARSE_ERROR',
          message: 'Could not parse the analysis response',
        };
      }
    } catch (error) {
      this.logger.error('Error analyzing food image:', error);
      
      if (error instanceof Error) {
        return {
          code: 'API_ERROR',
          message: error.message,
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  }
} 