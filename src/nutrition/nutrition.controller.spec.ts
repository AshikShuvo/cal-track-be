import { Test, TestingModule } from '@nestjs/testing';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { MealType, UserRole, AuthProvider } from '@prisma/client';

describe('NutritionController', () => {
  let controller: NutritionController;
  let service: NutritionService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    role: UserRole.USER,
    provider: AuthProvider.EMAIL,
    providerId: null,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNutritionService = {
    createFoodLog: jest.fn(),
    updateFoodLog: jest.fn(),
    deleteFoodLog: jest.fn(),
    getDailyReport: jest.fn(),
    getMonthlyReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutritionController],
      providers: [
        {
          provide: NutritionService,
          useValue: mockNutritionService,
        },
      ],
    }).compile();

    controller = module.get<NutritionController>(NutritionController);
    service = module.get<NutritionService>(NutritionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFoodLog', () => {
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

    it('should create a food log successfully', async () => {
      const mockCreatedFoodLog = {
        id: 'food-123',
        ...mockCreateFoodLogDto,
        userId: mockUser.id,
      };

      mockNutritionService.createFoodLog.mockResolvedValue(mockCreatedFoodLog);

      const result = await controller.createFoodLog(mockUser, mockCreateFoodLogDto);

      expect(result).toEqual(mockCreatedFoodLog);
      expect(mockNutritionService.createFoodLog).toHaveBeenCalledWith(
        mockUser.id,
        mockCreateFoodLogDto,
      );
    });
  });

  describe('updateFoodLog', () => {
    const mockUpdateFoodLogDto: UpdateFoodLogDto = {
      name: 'Updated Food',
      portion: 150,
    };

    it('should update a food log successfully', async () => {
      const mockUpdatedFoodLog = {
        id: 'food-123',
        ...mockUpdateFoodLogDto,
        userId: mockUser.id,
      };

      mockNutritionService.updateFoodLog.mockResolvedValue(mockUpdatedFoodLog);

      const result = await controller.updateFoodLog(
        mockUser,
        'food-123',
        mockUpdateFoodLogDto,
      );

      expect(result).toEqual(mockUpdatedFoodLog);
      expect(mockNutritionService.updateFoodLog).toHaveBeenCalledWith(
        mockUser.id,
        'food-123',
        mockUpdateFoodLogDto,
      );
    });
  });

  describe('deleteFoodLog', () => {
    it('should delete a food log successfully', async () => {
      const mockDeletedFoodLog = {
        id: 'food-123',
        userId: mockUser.id,
      };

      mockNutritionService.deleteFoodLog.mockResolvedValue(mockDeletedFoodLog);

      const result = await controller.deleteFoodLog(mockUser, 'food-123');

      expect(result).toEqual(mockDeletedFoodLog);
      expect(mockNutritionService.deleteFoodLog).toHaveBeenCalledWith(
        mockUser.id,
        'food-123',
      );
    });
  });

  describe('getDailyReport', () => {
    it('should return daily nutrition report', async () => {
      const mockDate = '2024-03-20';
      const mockReport = {
        totals: {
          calories: 2000,
          protein: 100,
          carbs: 200,
          fat: 70,
        },
        meals: {
          [MealType.BREAKFAST]: [],
          [MealType.LUNCH]: [],
          [MealType.DINNER]: [],
          [MealType.SNACK]: [],
        },
        foodLogs: [],
      };

      mockNutritionService.getDailyReport.mockResolvedValue(mockReport);

      const result = await controller.getDailyReport(mockUser, mockDate);

      expect(result).toEqual(mockReport);
      expect(mockNutritionService.getDailyReport).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date),
      );
    });
  });

  describe('getMonthlyReport', () => {
    it('should return monthly nutrition report', async () => {
      const mockYear = 2024;
      const mockMonth = 3;
      const mockReport = {
        totals: {
          calories: 60000,
          protein: 3000,
          carbs: 6000,
          fat: 2100,
        },
        meals: {
          [MealType.BREAKFAST]: [],
          [MealType.LUNCH]: [],
          [MealType.DINNER]: [],
          [MealType.SNACK]: [],
        },
        foodLogs: [],
      };

      mockNutritionService.getMonthlyReport.mockResolvedValue(mockReport);

      const result = await controller.getMonthlyReport(mockUser, mockYear, mockMonth);

      expect(result).toEqual(mockReport);
      expect(mockNutritionService.getMonthlyReport).toHaveBeenCalledWith(
        mockUser.id,
        mockYear,
        mockMonth,
      );
    });
  });
}); 