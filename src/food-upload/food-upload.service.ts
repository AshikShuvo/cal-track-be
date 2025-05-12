import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { ChatGptFoodService } from '../ai/chatgpt-food.service';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from '../ai/dto/food-analysis.dto';
import { StorageResult } from '../storage/interfaces/storage-provider.interface';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

type UploadResponse = {
  success: boolean;
  storage?: StorageResult;
  analysis?: FoodAnalysisResultDto;
  error?: FoodAnalysisErrorDto;
};

@Injectable()
export class FoodUploadService {
  private readonly logger = new Logger(FoodUploadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly chatGptFoodService: ChatGptFoodService,
  ) {}

  async handleUpload(file: Express.Multer.File): Promise<UploadResponse> {
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

      // Return both the storage result and analysis
      return {
        success: true,
        storage: storageResult,
        analysis: analysisResult,
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