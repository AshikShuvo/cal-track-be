import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FoodUploadModule } from './food-upload/food-upload.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { AiModule } from './ai/ai.module';
import { StorageModule } from './storage/storage.module';
import { LocalStorageConfig } from './storage/interfaces/storage-config.interface';
import sessionConfig from './config/session.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [sessionConfig],
    }),
    PrismaModule,
    AuthModule,
    FoodUploadModule,
    NutritionModule,
    AiModule,
    StorageModule.register({
      provider: 'local',
      basePath: 'uploads',
      baseUrl: process.env.STORAGE_BASE_URL || 'http://localhost:3000/uploads',
      tempDir: 'temp',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
      createDirectories: true,
    } as LocalStorageConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
