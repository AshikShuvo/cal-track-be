import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { ChatGptFoodService } from '../ai/chatgpt-food.service';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from '../ai/dto/food-analysis.dto';
import { StorageResult } from '../storage/interfaces/storage-provider.interface';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MealType } from '@prisma/client';

type UploadResponse = {
  success: boolean;
  storage?: StorageResult;
  analysis?: FoodAnalysisResultDto;
  error?: FoodAnalysisErrorDto;
  foodLogId?: string;
};

@Injectable()
export class FoodUploadService {
  private readonly logger = new Logger(FoodUploadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly chatGptFoodService: ChatGptFoodService,
    private readonly prisma: PrismaService,
  ) {}

  async handleUpload(file: Express.Multer.File, userId: string, mealType: MealType): Promise<UploadResponse> {
    try {
      // First, analyze the image
      const analysisResult = await this.chatGptFoodService.analyzeFoodImage(file.buffer);
      
      if ('code' in analysisResult) {
        // If there's an error in analysis, return it
        return {
          success: false,
          error: analysisResult,
        };
      }

      // Create a temporary file for storage
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempFilePath = path.join(tempDir, `${uuidv4()}${path.extname(file.originalname)}`);
      await fs.writeFile(tempFilePath, file.buffer);

      // Create a file object with path for storage
      const fileWithPath = {
        ...file,
        path: tempFilePath,
      };

      // Store the file
      const storageResult = await this.storageService.uploadFile(fileWithPath);

      // Create food log with nutrition info
      const foodLog = await this.prisma.foodLog.create({
        data: {
          userId,
          name: analysisResult.name,
          portion: analysisResult.portion,
          mealType,
          consumedAt: new Date(),
          nutrition: {
            create: {
              calories: analysisResult.nutrition.calories,
              protein: analysisResult.nutrition.protein,
              carbs: analysisResult.nutrition.carbs,
              fat: analysisResult.nutrition.fat,
              fiber: analysisResult.nutrition.fiber,
              sugar: analysisResult.nutrition.sugar,
              sodium: analysisResult.nutrition.sodium,
            },
          },
          image: {
            create: {
              url: storageResult.url,
              aiAnalysis: JSON.parse(JSON.stringify(analysisResult)),
            },
          },
        },
        include: {
          nutrition: true,
          image: true,
        },
      });

      // Clean up temporary file
      await fs.unlink(tempFilePath);

      return {
        success: true,
        storage: storageResult,
        analysis: analysisResult,
        foodLogId: foodLog.id,
      };
    } catch (error) {
      this.logger.error('Error processing food upload:', error);
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to process food upload',
        },
      };
    }
  }
} 