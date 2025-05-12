import { Module } from '@nestjs/common';
import { FoodUploadController } from './food-upload.controller';
import { FoodUploadService } from './food-upload.service';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LocalStorageConfig } from '../storage/interfaces/storage-config.interface';

@Module({
  imports: [
    StorageModule.register({
      provider: 'local',
      basePath: 'uploads',
      baseUrl: process.env.STORAGE_BASE_URL || 'http://localhost:3000/uploads',
      tempDir: 'temp',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
      createDirectories: true,
    } as LocalStorageConfig),
    AiModule,
    PrismaModule,
  ],
  controllers: [FoodUploadController],
  providers: [FoodUploadService],
  exports: [FoodUploadService],
})
export class FoodUploadModule {} 