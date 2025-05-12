import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatGptFoodService } from './chatgpt-food.service';

@Module({
  imports: [ConfigModule],
  providers: [ChatGptFoodService],
  exports: [ChatGptFoodService],
})
export class AiModule {} 