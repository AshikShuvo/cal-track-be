import { Test, TestingModule } from '@nestjs/testing';
import { NutritionService } from './nutrition.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { MealType } from '@prisma/client';

describe('NutritionService', () => {
  let service: NutritionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    foodLog: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    goal: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NutritionService>(NutritionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFoodLog', () => {
    const mockUserId = 'user-123';
    const mockCreateFoodLogDto: CreateFoodLogDto = {
      name: 'Test Food',
      portion: 100,
      mealType: MealType.BREAKFAST,
      consumedAt: new Date(),
      nutrition: {
        calories: 300,
        protein: 20,
        carbs: 30,
        fat: 10,
      },
    };

    const mockCreatedFoodLog = {
      id: 'food-123',
      ...mockCreateFoodLogDto,
      userId: mockUserId,
    };

    it('should create a food log successfully', async () => {
      mockPrismaService.foodLog.create.mockResolvedValue(mockCreatedFoodLog);

      const result = await service.createFoodLog(mockUserId, mockCreateFoodLogDto);

      expect(result).toEqual(mockCreatedFoodLog);
      expect(mockPrismaService.foodLog.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateFoodLogDto,
          userId: mockUserId,
          nutrition: {
            create: mockCreateFoodLogDto.nutrition,
          },
        },
        include: {
          nutrition: true,
        },
      });
    });
  });

  describe('getDailyReport', () => {
    const mockUserId = 'user-123';
    const mockDate = new Date('2024-03-20');
    const mockFoodLogs = [
      {
        id: 'food-1',
        name: 'Breakfast',
        mealType: MealType.BREAKFAST,
        nutrition: {
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
        },
      },
      {
        id: 'food-2',
        name: 'Lunch',
        mealType: MealType.LUNCH,
        nutrition: {
          calories: 500,
          protein: 30,
          carbs: 50,
          fat: 20,
        },
      },
    ];

    it('should return aggregated nutrition data for a day', async () => {
      mockPrismaService.foodLog.findMany.mockResolvedValue(mockFoodLogs);

      const result = await service.getDailyReport(mockUserId, mockDate);

      expect(result.totals).toEqual({
        calories: 800,
        protein: 50,
        carbs: 80,
        fat: 30,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        proteinPercentage: 25,
        carbsPercentage: 40,
        fatPercentage: 33.75,
      });

      expect(result.meals[MealType.BREAKFAST].itemCount).toBe(1);
      expect(result.meals[MealType.LUNCH].itemCount).toBe(1);
      expect(result.meals[MealType.DINNER].itemCount).toBe(0);
      expect(result.meals[MealType.SNACK].itemCount).toBe(0);

      expect(mockPrismaService.foodLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          consumedAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          nutrition: true,
        },
      });
    });
  });

  describe('getMonthlyReport', () => {
    const mockUserId = 'user-123';
    const mockYear = 2024;
    const mockMonth = 3;

    it('should return aggregated nutrition data for a month', async () => {
      const mockFoodLogs = [
        {
          id: 'food-1',
          name: 'Breakfast',
          mealType: MealType.BREAKFAST,
          nutrition: {
            calories: 300,
            protein: 20,
            carbs: 30,
            fat: 10,
          },
        },
      ];

      mockPrismaService.foodLog.findMany.mockResolvedValue(mockFoodLogs);

      const result = await service.getMonthlyReport(mockUserId, mockYear, mockMonth);

      expect(result.totals).toEqual({
        calories: 300,
        protein: 20,
        carbs: 30,
        fat: 10,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        proteinPercentage: 26.666666666666668,
        carbsPercentage: 40,
        fatPercentage: 30,
      });

      expect(result.meals[MealType.BREAKFAST].itemCount).toBe(1);
      expect(result.meals[MealType.LUNCH].itemCount).toBe(0);
      expect(result.meals[MealType.DINNER].itemCount).toBe(0);
      expect(result.meals[MealType.SNACK].itemCount).toBe(0);

      expect(mockPrismaService.foodLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          consumedAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          nutrition: true,
        },
      });
    });
  });

  describe('getWeeklyReport', () => {
    const mockUserId = 'user-123';
    const mockStartDate = new Date('2024-03-18');
    const mockFoodLogs = [
      {
        id: 'food-1',
        name: 'Breakfast',
        mealType: MealType.BREAKFAST,
        nutrition: {
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
        },
      },
      {
        id: 'food-2',
        name: 'Lunch',
        mealType: MealType.LUNCH,
        nutrition: {
          calories: 500,
          protein: 30,
          carbs: 50,
          fat: 20,
        },
      },
    ];

    const mockGoals = {
      id: 'goal-1',
      userId: mockUserId,
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70,
    };

    it('should return aggregated nutrition data for a week', async () => {
      mockPrismaService.foodLog.findMany.mockResolvedValue(mockFoodLogs);
      mockPrismaService.goal.findFirst.mockResolvedValue(mockGoals);

      const result = await service.getWeeklyReport(mockUserId, mockStartDate);

      expect(result.totals).toEqual({
        calories: 800,
        protein: 50,
        carbs: 80,
        fat: 30,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        proteinPercentage: 25,
        carbsPercentage: 40,
        fatPercentage: 33.75,
      });

      expect(result.meals[MealType.BREAKFAST].itemCount).toBe(1);
      expect(result.meals[MealType.LUNCH].itemCount).toBe(1);
      expect(result.meals[MealType.DINNER].itemCount).toBe(0);
      expect(result.meals[MealType.SNACK].itemCount).toBe(0);

      expect(mockPrismaService.foodLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          consumedAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          nutrition: true,
        },
      });
    });

    it('should handle case when no goals are set', async () => {
      mockPrismaService.foodLog.findMany.mockResolvedValue(mockFoodLogs);
      mockPrismaService.goal.findFirst.mockResolvedValue(null);

      const result = await service.getWeeklyReport(mockUserId, mockStartDate);

      expect(result.totals).toBeDefined();
      expect(result.targetComparison).toBeUndefined();
    });
  });

  describe('getRangeReport', () => {
    const mockUserId = 'user-123';
    const mockStartDate = new Date('2024-03-01');
    const mockEndDate = new Date('2024-03-31');
    const mockFoodLogs = [
      {
        id: 'food-1',
        name: 'Breakfast',
        mealType: MealType.BREAKFAST,
        nutrition: {
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
        },
      },
      {
        id: 'food-2',
        name: 'Lunch',
        mealType: MealType.LUNCH,
        nutrition: {
          calories: 500,
          protein: 30,
          carbs: 50,
          fat: 20,
        },
      },
    ];

    const mockGoals = {
      id: 'goal-1',
      userId: mockUserId,
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70,
    };

    it('should return aggregated nutrition data for a date range', async () => {
      mockPrismaService.foodLog.findMany.mockResolvedValue(mockFoodLogs);
      mockPrismaService.goal.findFirst.mockResolvedValue(mockGoals);

      const result = await service.getRangeReport(mockUserId, mockStartDate, mockEndDate);

      expect(result.totals).toEqual({
        calories: 800,
        protein: 50,
        carbs: 80,
        fat: 30,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        proteinPercentage: 25,
        carbsPercentage: 40,
        fatPercentage: 33.75,
      });

      expect(result.meals[MealType.BREAKFAST].itemCount).toBe(1);
      expect(result.meals[MealType.LUNCH].itemCount).toBe(1);
      expect(result.meals[MealType.DINNER].itemCount).toBe(0);
      expect(result.meals[MealType.SNACK].itemCount).toBe(0);

      expect(mockPrismaService.foodLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          consumedAt: {
            gte: mockStartDate,
            lte: mockEndDate,
          },
        },
        include: {
          nutrition: true,
        },
      });
    });

    it('should handle case when no goals are set', async () => {
      mockPrismaService.foodLog.findMany.mockResolvedValue(mockFoodLogs);
      mockPrismaService.goal.findFirst.mockResolvedValue(null);

      const result = await service.getRangeReport(mockUserId, mockStartDate, mockEndDate);

      expect(result.totals).toBeDefined();
      expect(result.targetComparison).toBeUndefined();
    });
  });
}); 