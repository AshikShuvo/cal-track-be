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
      });

      expect(result.meals[MealType.BREAKFAST]).toHaveLength(1);
      expect(result.meals[MealType.LUNCH]).toHaveLength(1);
      expect(result.meals[MealType.DINNER]).toHaveLength(0);
      expect(result.meals[MealType.SNACK]).toHaveLength(0);

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
      });

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
}); 