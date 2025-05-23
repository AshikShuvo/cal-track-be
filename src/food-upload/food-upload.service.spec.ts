import { Test, TestingModule } from '@nestjs/testing';
import { FoodUploadService } from './food-upload.service';
import { StorageService } from '../storage/storage.service';
import { ChatGptFoodService } from '../ai/chatgpt-food.service';
import { MealType } from '../common/enums/meal-type.enum';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('c3e9947d-77bc-4138-8e8b-a8ad85c8adcd'),
}));

describe('FoodUploadService', () => {
  let service: FoodUploadService;
  const mockUserId = 'user-123';
  const mockMealType = MealType.BREAKFAST;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: '/tmp',
    filename: 'test.jpg',
    path: '/tmp/test.jpg',
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  const mockChatGptFoodService = {
    analyzeFoodImage: jest.fn(),
  };

  const mockPrismaService = {
    foodLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodUploadService,
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: ChatGptFoodService,
          useValue: mockChatGptFoodService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FoodUploadService>(FoodUploadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should analyze and store file, returning both results', async () => {
    const analysisResult = {
      name: 'Pizza',
      ingredients: ['dough', 'cheese', 'tomato sauce'],
      nutrition: {
        calories: 300,
        protein: 12,
        carbs: 35,
        fat: 15,
      },
    };
    const storageResult = { fileId: 'abc', url: 'http://localhost/abc.jpg' };
    mockChatGptFoodService.analyzeFoodImage.mockResolvedValueOnce(analysisResult);
    mockStorageService.uploadFile.mockResolvedValueOnce(storageResult);
    mockPrismaService.foodLog.create.mockResolvedValueOnce({
      id: 'food-123',
      ...analysisResult,
    });

    const result = await service.handleUpload(mockFile, mockUserId, mockMealType);
    expect(mockChatGptFoodService.analyzeFoodImage).toHaveBeenCalledWith(mockFile.buffer);
    expect(mockStorageService.uploadFile).toHaveBeenCalledWith({
      ...mockFile,
      path: '/home/bs-01474/personal/cal-track-be/temp/c3e9947d-77bc-4138-8e8b-a8ad85c8adcd.jpg',
    });
    expect(result).toEqual({
      success: true,
      storage: storageResult,
      analysis: analysisResult,
      foodLogId: 'food-123',
    });
  });

  it('should return error if analysis fails', async () => {
    const errorResult = { code: 'NO_ANALYSIS', message: 'Could not analyze' };
    mockChatGptFoodService.analyzeFoodImage.mockResolvedValueOnce(errorResult);
    const result = await service.handleUpload(mockFile, mockUserId, mockMealType);
    expect(result).toEqual({
      success: false,
      error: errorResult,
    });
    expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
  });
}); 