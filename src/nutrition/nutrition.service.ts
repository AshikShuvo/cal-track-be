import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { NutritionReportDto } from './dto/nutrition-report.dto';
import { MealType } from '@prisma/client';

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async createFoodLog(userId: string, createFoodLogDto: CreateFoodLogDto) {
    const { nutrition, ...foodLogData } = createFoodLogDto;
    
    return this.prisma.foodLog.create({
      data: {
        ...foodLogData,
        userId,
        nutrition: nutrition ? {
          create: nutrition
        } : undefined
      },
      include: {
        nutrition: true
      }
    });
  }

  async updateFoodLog(userId: string, foodLogId: string, updateFoodLogDto: UpdateFoodLogDto) {
    const { nutrition, ...foodLogData } = updateFoodLogDto;

    return this.prisma.foodLog.update({
      where: {
        id: foodLogId,
        userId
      },
      data: {
        ...foodLogData,
        nutrition: nutrition ? {
          upsert: {
            create: nutrition,
            update: nutrition
          }
        } : undefined
      },
      include: {
        nutrition: true
      }
    });
  }

  async deleteFoodLog(userId: string, foodLogId: string) {
    return this.prisma.foodLog.delete({
      where: {
        id: foodLogId,
        userId
      }
    });
  }

  async getDailyReport(userId: string, date: Date): Promise<NutritionReportDto> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const foodLogs = await this.prisma.foodLog.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        nutrition: true
      }
    });

    return this.aggregateNutritionData(foodLogs);
  }

  async getMonthlyReport(userId: string, year: number, month: number): Promise<NutritionReportDto> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const foodLogs = await this.prisma.foodLog.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        nutrition: true
      }
    });

    return this.aggregateNutritionData(foodLogs);
  }

  private aggregateNutritionData(foodLogs: any[]): NutritionReportDto {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    const meals: Record<MealType, any[]> = {
      BREAKFAST: [],
      LUNCH: [],
      DINNER: [],
      SNACK: []
    };

    foodLogs.forEach(log => {
      if (log.nutrition) {
        totals.calories += log.nutrition.calories;
        totals.protein += log.nutrition.protein || 0;
        totals.carbs += log.nutrition.carbs || 0;
        totals.fat += log.nutrition.fat || 0;
        totals.fiber += log.nutrition.fiber || 0;
        totals.sugar += log.nutrition.sugar || 0;
        totals.sodium += log.nutrition.sodium || 0;
      }
      meals[log.mealType].push(log);
    });

    return {
      totals,
      meals,
      foodLogs
    };
  }
} 