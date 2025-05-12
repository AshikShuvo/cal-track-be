import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { NutritionReportDto, NutritionSummaryDto, MealSummaryDto } from './dto/nutrition-report.dto';
import { MealType } from '@prisma/client';

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

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

    // Get food logs for the day
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

    // Get user's daily goals
    const goals = await this.prisma.goal.findFirst({
      where: {
        userId,
        startDate: {
          lte: date
        },
        OR: [
          { endDate: null },
          { endDate: { gte: date } }
        ]
      }
    });

    return this.generateReport(foodLogs, date, goals);
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

    return this.generateReport(foodLogs, startDate);
  }

  async getWeeklyReport(userId: string, startDate: Date): Promise<NutritionReportDto> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Get 7 days from start date

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

    // Get user's goals for the week
    const goals = await this.prisma.goal.findFirst({
      where: {
        userId,
        startDate: {
          lte: endDate
        },
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ]
      }
    });

    return this.generateReport(foodLogs, startDate, goals);
  }

  async getRangeReport(userId: string, startDate: Date, endDate: Date): Promise<NutritionReportDto> {
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

    // Get user's goals for the date range
    const goals = await this.prisma.goal.findFirst({
      where: {
        userId,
        startDate: {
          lte: endDate
        },
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ]
      }
    });

    return this.generateReport(foodLogs, startDate, goals);
  }

  private calculateNutritionSummary(nutritionData: any[]): NutritionSummaryDto {
    const summary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    nutritionData.forEach(item => {
      if (item.nutrition) {
        summary.calories += item.nutrition.calories || 0;
        summary.protein += item.nutrition.protein || 0;
        summary.carbs += item.nutrition.carbs || 0;
        summary.fat += item.nutrition.fat || 0;
        summary.fiber += item.nutrition.fiber || 0;
        summary.sugar += item.nutrition.sugar || 0;
        summary.sodium += item.nutrition.sodium || 0;
      }
    });

    // Calculate macronutrient percentages
    const totalCalories = summary.calories;
    const proteinCalories = summary.protein * 4; // 4 calories per gram of protein
    const carbsCalories = summary.carbs * 4; // 4 calories per gram of carbs
    const fatCalories = summary.fat * 9; // 9 calories per gram of fat

    return {
      ...summary,
      proteinPercentage: totalCalories ? (proteinCalories / totalCalories) * 100 : 0,
      carbsPercentage: totalCalories ? (carbsCalories / totalCalories) * 100 : 0,
      fatPercentage: totalCalories ? (fatCalories / totalCalories) * 100 : 0
    };
  }

  private generateMealSummary(foodLogs: any[], mealType: MealType): MealSummaryDto {
    const mealLogs = foodLogs.filter(log => log.mealType === mealType);
    const nutrition = this.calculateNutritionSummary(mealLogs);

    return {
      nutrition,
      itemCount: mealLogs.length,
      items: mealLogs.map(log => ({
        id: log.id,
        name: log.name,
        portion: log.portion,
        calories: log.nutrition?.calories || 0,
        protein: log.nutrition?.protein || 0,
        carbs: log.nutrition?.carbs || 0,
        fat: log.nutrition?.fat || 0
      }))
    };
  }

  private generateReport(foodLogs: any[], date: Date, goals?: any): NutritionReportDto {
    const totals = this.calculateNutritionSummary(foodLogs);
    const meals = {
      BREAKFAST: this.generateMealSummary(foodLogs, MealType.BREAKFAST),
      LUNCH: this.generateMealSummary(foodLogs, MealType.LUNCH),
      DINNER: this.generateMealSummary(foodLogs, MealType.DINNER),
      SNACK: this.generateMealSummary(foodLogs, MealType.SNACK)
    };

    const targetComparison = goals ? {
      calories: goals.calories,
      protein: goals.protein,
      carbs: goals.carbs,
      fat: goals.fat
    } : undefined;

    const foodLogsList = foodLogs.map(log => ({
      id: log.id,
      name: log.name,
      portion: log.portion,
      mealType: log.mealType,
      consumedAt: log.consumedAt,
      nutrition: log.nutrition ? {
        calories: log.nutrition.calories || 0,
        protein: log.nutrition.protein || 0,
        carbs: log.nutrition.carbs || 0,
        fat: log.nutrition.fat || 0,
        fiber: log.nutrition.fiber || 0,
        sugar: log.nutrition.sugar || 0,
        sodium: log.nutrition.sodium || 0,
        proteinPercentage: 0,
        carbsPercentage: 0,
        fatPercentage: 0
      } : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        proteinPercentage: 0,
        carbsPercentage: 0,
        fatPercentage: 0
      }
    }));

    return {
      date,
      totals,
      meals,
      targetComparison,
      foodLogs: foodLogsList
    };
  }
} 