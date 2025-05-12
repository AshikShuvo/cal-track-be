import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodUploadService } from './food-upload.service';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from '../ai/dto/food-analysis.dto';
import { StorageResult } from '../storage/interfaces/storage-provider.interface';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

type UploadResponse = {
  success: boolean;
  storage?: StorageResult;
  analysis?: FoodAnalysisResultDto;
  error?: FoodAnalysisErrorDto;
};

@ApiTags('Food Upload')
@Controller('food-upload')
export class FoodUploadController {
  constructor(private readonly foodUploadService: FoodUploadService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Food image file (JPEG, PNG, or GIF)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFoodImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResponse> {
    // Will delegate to service
    return this.foodUploadService.handleUpload(file);
  }
} 