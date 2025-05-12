import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import sessionConfig from './config/session.config';
import { CommonModule } from './common/common.module';
import { FoodUploadModule } from './food-upload/food-upload.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [sessionConfig],
    }),
    PrismaModule,
    AuthModule,
    SharedModule,
    CommonModule,
    FoodUploadModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
