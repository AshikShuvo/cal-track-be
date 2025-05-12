import { Controller, Post, UploadedFile, UseInterceptors, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodUploadService } from './food-upload.service';
import { FoodAnalysisResultDto, FoodAnalysisErrorDto } from '../ai/dto/food-analysis.dto';
import { StorageResult } from '../storage/interfaces/storage-provider.interface';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { MealType } from '@prisma/client';

type UploadResponse = {
  success: boolean;
  storage?: StorageResult;
  analysis?: FoodAnalysisResultDto;
  error?: FoodAnalysisErrorDto;
  foodLogId?: string;
};

@ApiTags('Food Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
        mealType: {
          type: 'string',
          enum: Object.values(MealType),
          description: 'Type of meal (BREAKFAST, LUNCH, DINNER, SNACK)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFoodImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body('mealType') mealType: MealType,
  ): Promise<UploadResponse> {
    return this.foodUploadService.handleUpload(file, user.id, mealType);
  }
} 