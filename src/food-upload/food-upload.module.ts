import { Module } from '@nestjs/common';
import { FoodUploadController } from './food-upload.controller';
import { FoodUploadService } from './food-upload.service';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { storageConfig } from '../config/storage.config';

@Module({
  imports: [
    StorageModule.register(storageConfig),
    AiModule,
  ],
  controllers: [FoodUploadController],
  providers: [FoodUploadService],
})
export class FoodUploadModule {} 